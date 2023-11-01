
import yargs from 'yargs'

export function getArgs() {
  return yargs(process.argv.slice(2))
  .usage('Usage: $0 --username [username] --password [password]')
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
    default: 'http://127.0.0.1/13378',
    type: 'string',
    demandOption: false
  })
  .option('container', {
    alias: 'c',
    describe: 'Name of the Audiobookshelf Docker container',
    default: 'audiobookshelf-audiobookshelf-1',
    type: 'string',
    demandOption: false
  })
  .argv
}
