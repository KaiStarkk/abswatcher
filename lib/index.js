#!/usr/bin/env node

import Audiobookshelf from './Audiobookshelf.js'
import Watcher from './Watcher.js'
import DockerContainer from './DockerContainer.js'
import yargs from 'yargs'
import logger from './logger.js'

// Parse arguments
const argv = yargs(process.argv.slice(2))
  .usage('Usage: $0 --username [username] --password [password] [options]')
  .option('username', {
    alias: 'u',
    describe: 'Audiobookshelf username',
    type: 'string',
    demandOption: true
  })
  .option('password', {
    alias: 'p',
    describe: 'Audiobookshelf password',
    type: 'string',
    demandOption: true
  })
  .option('server', {
    alias: 's',
    describe: 'URL of the Audiobookshelf server',
    default: 'http://127.0.0.1:13378',
    type: 'string',
    demandOption: false
  })
  .option('container', {
    alias: 'c',
    describe: 'Name of the Audiobookshelf Docker container',
    type: 'string',
    demandOption: false
  })
  .option('path-mappings', {
    alias: 'm',
    describe: 'Local=Remote folder pairs (comma-separated)',
    type: 'string',
    demandOption: false
  })
  .conflicts('container', 'path-mappings')
  .check((argv) => {
    const hasContainer = !!argv.container
    const hasPathMappings = !!argv.pathMappings

    if (!hasContainer && !hasPathMappings) {
      logger.error('Error: Either --container or --path-mappings must be provided.')
      throw new Error('Invalid arguments')
    }
    if (hasContainer && hasPathMappings) {
      logger.error('Error: Only one of --container or --path-mappings can be provided.')
      throw new Error('Invalid arguments')
    }
    return true
  }).argv

logger.debug('Parsed arguments:', argv)

const { username, password, server, container, pathMappings } = argv
const abs = new Audiobookshelf(username, password, server)

let watcher
if (pathMappings) {
  watcher = new Watcher(abs, pathMappings)
} else {
  const dockerContainer = new DockerContainer(container)
  watcher = new Watcher(abs, null, dockerContainer)
}

watcher.watch().catch((error) => logger.error(error))
