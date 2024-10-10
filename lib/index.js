#!/usr/bin/env node

import Audiobookshelf from './Audiobookshelf.mjs'
import AudiobookshelfWatcher from './AudiobookshelfWatcher.mjs'
import DockerContainer from './DockerContainer.mjs'
import { getArgs } from './args.mjs'
import logger from './tracer.mjs'

const { username, password, server, container, network } = getArgs()
const abs = new Audiobookshelf(username, password, server)
let watcher

if (container) {
  const dockerContainer = new DockerContainer(container)
  watcher = new AudiobookshelfWatcher(abs, dockerContainer)
} else if (network) {
  watcher = new AudiobookshelfWatcher(abs, null, network)
}

watcher.watch()
  .catch(error => logger.error(error))
