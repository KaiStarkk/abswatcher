import { isSameOrSubPath, isSubPath, pathToPosix } from './utils.mjs'
import logger from './tracer.mjs'

export default class WatchedFolders {
  constructor(libraries, mounts) {
    this.folders = getFolders(libraries)
    remapFolders(this.folders, mounts)
  }

  getDestinationPath(path) {
    if (!path) return { path: null, libraries: [] }
    path = pathToPosix(path)
    const watchedFolder = this.folders.find(folder => isSubPath(folder.fullPath, path))
    if (!watchedFolder) {
      logger.error(`Path ${path} not found in watched folders`)
      return
    }
    path = path.replace(watchedFolder.mountSrc, watchedFolder.mountDst)
    return { path, libraries: watchedFolder.libraries }
  }

  getWatchedPaths() {
    return this.folders.map(folder => folder.fullPath)
  }
}

function remapFolders(folders, mounts) {
  for (const folder of folders) {
    for (const mount of mounts) {
      if (isSameOrSubPath(mount.Destination, folder.fullPath)) {
        folder.mountDst = mount.Destination
        folder.mountSrc = pathToPosix(mount.Source.replace(/^\/run\/desktop\/mnt\/host\/([a-z])\//, '$1:\\'))
        folder.fullPath = pathToPosix(folder.fullPath).replace(folder.mountDst, folder.mountSrc)
        break
      }
    }
  }
}

function getFolders(libraries) {
  let folders = {}
  for (const library of libraries) {
    for (const folder of library.folders) {
      (folders[folder.fullPath] ??= { fullPath: folder.fullPath, libraries: [] }).libraries.push(library.id)
    }
  }
  folders = Object.values(folders)
  return folders
}


