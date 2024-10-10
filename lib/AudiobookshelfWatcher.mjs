import Watcher from 'watcher'
import WatchedFolders from './WatchedFolders.mjs'
import logger from './tracer.mjs'

export default class AudiobookshelfWatcher {
  constructor(abs, container = null, pathMap = null) {
    this.abs = abs
    this.container = container
    this.pathMap = pathMap
    this.libraries = []
    this.watchedLibraries = []
    this.folders = []
    this.initialized = false
  }

  async getWatchedLibraries() {
    this.libraries = await this.abs.getLibraries()
    if (!this.libraries.length) {
      logger.error(`No Audiobookshelf libraries found. Please add at least one library before starting abswatcher.`)
      process.exit(1)
    }
    this.watchedLibraries = this.libraries.filter((library) => library.settings.disableWatcher === false)
    if (!this.watchedLibraries.length) {
      logger.error(`All Audiobookshelf libraries have watcher disabled. Please enable watcher in at least one library before starting abswatcher.`)
      process.exit(1)
    }
    logger.debug(`Libraries: ${JSON.stringify(this.watchedLibraries.map((library) => library.name))})`)
  }

  async init() {
    if (this.initialized) return

    await this.getWatchedLibraries()

    if (this.pathMap) {
      const pathDict = this.pathMap.split(',').map((pair) => {
        const [local, remote] = pair.split('=')
        return { Source: local, Destination: remote }
      })
      logger.debug(`Watching share: ${JSON.stringify(pathDict.map((map) => map.Destination))}`)
      this.folders = new WatchedFolders(this.watchedLibraries, pathDict)
      this.initialized = true
    } else if (this.container) {   
      const containerData = await container.inspect()
      if (!containerData || !containerData.length) {
        logger.error(`Docker container ${container} could not be inspected.`)
        process.exit(1)
      }
      if (!containerData[0].Mounts) {
        logger.error(`Docker container ${container} has no mounts.`)
        process.exit(1)
      }
      const mounts = containerData[0].Mounts.filter(mount => mount.Type === 'bind')
      if (!mounts.length) {
        logger.error(`Docker container ${container} has no bind mounts.`)
        process.exit(1)
      }
      logger.debug(`Bind Mounts: ${JSON.stringify(mounts.map(mount => mount.Destination))}`)
      this.folders = new WatchedFolders(watchedLibraries, mounts)
      this.initialized = true
    }
  }

  async watch() {
    if (!this.initialized) await this.init()
  
    const watched = this.folders.getWatchedPaths()

    logger.debug (`Watched paths: ${JSON.stringify(watched)}`)
    
    const watcher = new Watcher(watched, {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        renameDetection: true,
        renameTimeout: 2000,
        recursive: true,
        ignoreInitial: true,
        persistent: true
      })
    
    watcher.on('ready', () => logger.info('Ready for changes'))
    watcher.on('add', (path) => this.#update('add', path))
    watcher.on('rename', (oldPath, path) => this.#update('rename', path, oldPath))
    watcher.on('unlink', (path) => this.#update('unlink', path))
    watcher.on('error', (error) => logger.error(`Watcher error: ${error}`))
    watcher.on('close', () => logger.info('Watcher closed'))    
  }

  #update(type, path, oldPath = null) {
    const { path: destinationPath, libraries } = this.folders.getDestinationPath(path)
    const { path: destinationOldPath } = this.folders.getDestinationPath(oldPath)
    this.abs.updateLibraries(type, libraries, destinationPath, destinationOldPath)
  }
}