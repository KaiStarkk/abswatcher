import tracer from 'tracer';

const logger = tracer.colorConsole({ level: process.env.ABSWATCHER_LOG_LEVEL || 'info'});

export default logger;