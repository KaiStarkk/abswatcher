// Watcher.js
import WatcherLib from 'watcher'
import path from 'node:path'
import logger from './logger.js'

export default class Watcher {
  constructor(abs, pathMappings = null, dockerContainer = null) {
    this.abs = abs
    this.pathMappings = pathMappings
    this.dockerContainer = dockerContainer
    this.initialized = false
    this.folders = []
  }

  async init() {
    if (this.initialized) return

    if (this.pathMappings) {
      const pathDict = this.pathMappings.split(',').map((pair) => {
        const [local, remote] = pair.split('=')
        return { Source: local, Destination: remote }
      })
      await this.setupFolders(pathDict)
    } else if (this.dockerContainer) {
      await this.dockerContainer.init()
      const containerData = await this.dockerContainer.inspect()
      const bindMounts = containerData[0].Mounts.filter((mount) => mount.Type === 'bind')

      if (!bindMounts.length) {
        throw new Error(`No bind mounts found for container ${this.dockerContainer.name}.`)
      }

      await this.setupFolders(bindMounts)
    } else {
      throw new Error('Either pathMappings or dockerContainer must be provided.')
    }

    this.watchedPaths = this.getWatchedPaths()

    this.watcher = new WatcherLib(this.watchedPaths, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      renameDetection: true,
      renameTimeout: 2000,
      recursive: true,
      ignoreInitial: true,
      persistent: true
    })

    this.watcher.on('ready', () => logger.info('Ready for changes'))
    this.watcher.on('add', (path) => this.update('add', path))
    this.watcher.on('rename', (oldPath, path) => this.update('rename', path, oldPath))
    this.watcher.on('unlink', (path) => this.update('unlink', path))
    this.watcher.on('error', (error) => logger.error(`Watcher error: ${error}`))
    this.watcher.on('close', () => logger.info('Watcher closed'))

    this.initialized = true
  }

  async setupFolders(mounts) {
    const libraries = await this.abs.getLibraries()
    this.folders = this.getFolders(libraries)
    this.remapFolders(mounts)
    this.watchedPaths = this.getWatchedPaths()
    logger.debug(`Initialized Watcher with watched paths: ${JSON.stringify(this.watchedPaths)}`)
  }

  getFolders(libraries) {
    let folders = {}
    for (const library of libraries) {
      for (const folder of library.folders) {
        ;(folders[folder.fullPath] ??= { fullPath: folder.fullPath, libraries: [] }).libraries.push(library.id)
      }
    }
    return Object.values(folders)
  }

  remapFolders(mounts) {
    for (const folder of this.folders) {
      for (const mount of mounts) {
        if (this.isSameOrSubPath(mount.Destination, folder.fullPath)) {
          folder.mountDst = mount.Destination
          folder.mountSrc = this.pathToPosix(mount.Source)
          folder.fullPath = this.pathToPosix(folder.fullPath).replace(folder.mountDst, folder.mountSrc)
          break
        }
      }
    }
  }

  getWatchedPaths() {
    return this.folders.map((folder) => folder.fullPath)
  }

  async watch() {
    await this.init()
  }

  update(type, path, oldPath = null) {
    logger.debug(`Updating libraries for type: ${type}, path: ${path}, oldPath: ${oldPath}`)
    const { path: destinationPath, libraries } = this.getDestinationPath(path)
    const { path: destinationOldPath } = this.getDestinationPath(oldPath)
    this.abs.updateLibraries(type, libraries, destinationPath, destinationOldPath)
  }

  getDestinationPath(sourcePath) {
    if (!sourcePath) return { path: null, libraries: [] }
    sourcePath = this.pathToPosix(sourcePath)
    const watchedFolder = this.folders.find((folder) => this.isSubPath(folder.fullPath, sourcePath))
    if (!watchedFolder) {
      logger.error(`Path ${sourcePath} not found in watched folders`)
      return { path: null, libraries: [] }
    }
    const destinationPath = sourcePath.replace(watchedFolder.mountSrc, watchedFolder.mountDst)
    return { path: destinationPath, libraries: watchedFolder.libraries }
  }

  isSameOrSubPath(parentPath, childPath) {
    if (parentPath === childPath) return true
    const relativePath = path.relative(parentPath, childPath)
    return relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath))
  }

  isSubPath(parentPath, childPath) {
    const relativePath = path.relative(parentPath, childPath)
    return relativePath && !relativePath.startsWith('..') && !path.isAbsolute(relativePath)
  }

  pathToPosix(p) {
    return p.replace(/\\/g, '/')
  }
}
