import { execute } from './utils.mjs'
//import loggerbase from './logger.mjs'
//const logger = loggerbase.child({ label: 'docker' })
import logger from './tracer.mjs'

export default class DockerContainer {
  constructor(name) {
    this.name = name
    this.initialized = false
  }

  async init() {
    if (this.initialized) return
    this.info = await inspectContainer(this.name)
    this.initialized = true
  }

  async inspect() {
    await this.init()
    return this.info
  }
}

async function getContexts() {
  return JSON.parse(await execute('docker context ls --format json')).map(context => { return { name: context.Name, current: context.Current }})
}

async function tryOtherContexts(name) {
  const contexts = await getContexts()
  logger.debug(`Contexts: ${JSON.stringify(contexts)}`)
  const otherContexts = contexts.filter(context => !context.current).map(context => context.name)
  logger.debug(`Other contexts: ${JSON.stringify(otherContexts)}`)
  const { name: currentContext } = contexts.find(context => context.current)
  logger.debug(`Current context: ${currentContext}`)
  for (const otherContext of otherContexts) {
    const containers  = await getContainerIds(name, otherContext)
    if (containers) return containers
  }
  logger.info(`Failed to inspect container ${name} in any context.`)
  await execute(`docker context use ${currentContext.name}`)
  return null
}

async function handleError(error, name, context) {
  if (!context) {
    if (error.message.includes('is not recognized as an internal or external command')) {
      logger.fatal(`Docker command not found. Was docker installed and added to PATH?`)
      process.exit(1)
    }
    logger.info(`Failed to connnect to Docker using the current default context. Trying other contexts...`)
    return await tryOtherContexts(name)
  } else {
    logger.info(`Failed to connect to Docker using context ${context}`)
    return null
  }
}

async function switchDefaultContext(context) {
  await execute(`docker context use ${context}`)
}

async function getContainerIds(name, context) {
  try {
    if (context) await switchDefaultContext(context)
    const containers = (await execute(`docker container ls --filter "name=${name}*" -q`)).trim().split('\n')
    if (!containers.length) {
      logger.info(`No containers found with name ${name}`)
      return null
    }
    return containers
  } catch (error) {
    return await handleError(error, name, context)
  }
}

async function getContainerInfo(container) {
  try {
    return JSON.parse(await execute(`docker container inspect -f json ${container}`))
  } catch (error) {
    logger.info(`Failed to inspect container ${container}`)
    return null
  }
}

async function inspectContainer(name, context = null) {
  const containers = await getContainerIds(name, context)
  return containers ? await getContainerInfo(containers[0]) : null
}

  