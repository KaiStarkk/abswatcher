import Audiobookshelf from './Audiobookshelf.mjs'
import AudiobookshelfWatcher from './AudiobookshelfWatcher.mjs'
import DockerContainer from './DockerContainer.mjs'
import { getArgs } from './args.mjs'
import logger from './tracer.mjs'

const { username, password, server, container } = getArgs()
const abs = new Audiobookshelf(username, password, server)
const dockerContainer = new DockerContainer(container)
const watcher = new AudiobookshelfWatcher(abs, dockerContainer)
watcher.watch()
  .catch(error => logger.error(error))
