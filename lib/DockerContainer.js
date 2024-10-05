// DockerContainer.js
import child_process from 'child_process'
import { promisify } from 'node:util'
import logger from './logger.js'

const exec = promisify(child_process.exec)

export default class DockerContainer {
  constructor(name) {
    this.name = name
    this.initialized = false
  }

  async init() {
    if (this.initialized) return
    this.info = await this.inspectContainer(this.name)
    this.initialized = true
  }

  async inspect() {
    await this.init()
    return this.info
  }

  async execute(command) {
    const { stdout } = await exec(command)
    return stdout
  }

  async inspectContainer(name, context = null) {
    const containers = await this.getContainerIds(name, context)
    if (!containers) {
      logger.error(`Container ${name} does not exist.`)
      return null
    }
    return await this.getContainerInfo(containers[0])
  }

  async getContainerIds(name, context) {
    try {
      if (context) await this.switchDefaultContext(context)
      const containers = (await this.execute(`docker container ls --filter "name=${name}*" -q`)).trim().split('\n')
      if (!containers.length) {
        logger.info(`No containers found with name ${name}`)
        return null
      }
      return containers
    } catch (error) {
      logger.error(`Error while getting container IDs: ${error.message}`)
      return null
    }
  }

  async getContainerInfo(container) {
    try {
      return JSON.parse(await this.execute(`docker container inspect -f json ${container}`))
    } catch (error) {
      logger.info(`Failed to inspect container ${container}`)
      return null
    }
  }

  async switchDefaultContext(context) {
    await this.execute(`docker context use ${context}`)
  }
}
