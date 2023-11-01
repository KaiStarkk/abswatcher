import tracer from 'tracer';

const logger = tracer.colorConsole({ level: process.env.LOG_LEVEL || 'info'});

export default logger;