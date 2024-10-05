// logger.js
import tracer from 'tracer'

const logger = tracer.colorConsole({ level: process.env.ABSWATCHER_LOG_LEVEL || 'debug' })

export default logger
