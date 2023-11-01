import axios from 'axios'
import logger from './tracer.mjs'

export default class Audiobookshelf {
    
  constructor(username, password, serverUrl = "http://127.0.0.1:3333") {
    this.username = username
    this.password = password
    this.config = { baseURL: serverUrl, timeout: 5000 }
    this.loggedIn = false
  }

  newConfig() {
    return { ...this.config, signal: AbortSignal.timeout(2000) }
  }

  async login() {
    try {
      const { username, password } = this
      const config = this.newConfig()
      const loginBody = { username: username, password: password }
      const { data: { user: { token } } } = await axios.post('/login', loginBody, config)
      this.config.headers = { Authorization: `Bearer ${token}` }
      this.loggedIn = true
    } catch (error) {
      this.handleError(error)
    }
  }

  async apiCall(func, isFatal = true) {
    try {
      if (!this.loggedIn) await this.login()
      const config  = this.newConfig()
      return await func(config)
    } catch (error) {
      this.handleError(error, isFatal)
    }
  }

  async getLibraries() {
    return await this.apiCall(async (config) => {
      const { data: { libraries } } = await axios.get('/api/libraries', config)
      return libraries
    }, true)
  }

  async updateLibraries(type, libraries, path, oldPath = null) {
    await this.apiCall(async (config) => {
      for (const libraryId of libraries) {
        logger.debug(`Updating type: ${type} library: ${libraryId} path: ${path}`)
        await axios.post(`/api/watcher/update`, { type, libraryId, path, oldPath }, config)
      }
    }, false)
  }

  handleError(error, isFatal = true) {
    const loggerFunc = isFatal ? logger.fatal : logger.error
    if (error.response) {      
      loggerFunc(`Server responded with status code ${error.response.status}: ${error.response.data}`)
    } else { 
      loggerFunc(`Axios error: ${error.message}`)
      switch(error.code) {
        case 'ECONNREFUSED':
        case 'ERR_CANCELED':
          loggerFunc(`Could not connect to server ${this.config.baseURL}. Is it running?`)
          break
        case 'EPROTO':
          new URL(this.config.baseURL).protocol === 'https:' ? 
            loggerFunc(`Could not connect to server ${this.config.baseURL}. Change protocol to http?`) :
            loggerFunc(error)
          break
        default:
          loggerFunc(error)
      }
    }
    if (isFatal) process.exit(1)
  }
}
