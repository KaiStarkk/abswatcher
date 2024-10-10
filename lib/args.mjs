
import yargs from 'yargs'
import logger from './tracer.mjs'

export function getArgs() {
  return yargs(process.argv.slice(2))
    .usage('Usage: $0 --username [username] --password [password] (--docker [container_name] | --network X:/local_path=/remote_path)')
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
      demandOption: false
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
      describe: 'Docker mode - name of the Audiobookshelf Docker container',
      type: 'string',
      demandOption: false
    })
    .option('network', {
      alias: 'n',
      describe: 'Network mode - fileshare Local=Remote folder mappings (comma-separated)',
      type: 'string',
      demandOption: false
    })
    .conflicts('docker', 'network')
    .check((argv) => {
      const hasContainer = !!argv.docker
      const hasPathMap = !!argv.network

      if (!hasContainer && !hasPathMap) {
        logger.error('Error: Either --docker or --network must be provided.')
        throw new Error('Invalid arguments')
      }
      if (hasContainer && hasPathMap) {
        logger.error('Error: Only one of --docker or --network can be provided.')
        throw new Error('Invalid arguments')
      }      
      if (!argv.password) {
        argv.password = process.env.ABSWATCHER_PASSWORD
      }
      if (!argv.password) {
        logger.error('Error: Password must be provided either as an argument or through the AUDIOBOOKSHELF_PASSWORD environment variable.')
        throw new Error('Invalid arguments')
      }
      return true
    }).argv
}
