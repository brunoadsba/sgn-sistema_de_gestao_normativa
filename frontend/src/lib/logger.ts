import winston from 'winston';

// Logger simplificado sem thread-stream para evitar crashes
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.errors({ stack: true })
  ),
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      handleRejections: true
    })
  ],
  exceptionHandlers: [new winston.transports.Console()],
  rejectionHandlers: [new winston.transports.Console()],
  exitOnError: false
});

// Fallback para exceções não capturadas
process.on('uncaughtException', (err) => {
  console.error('Exceção não capturada:', err);
  // Usar console.error como fallback se logger falhar
  try {
    logger.error('Exceção não capturada', { error: err });
  } catch (logError) {
    console.error('Logger falhou:', logError);
  }
});

export default logger;
