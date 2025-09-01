// src/utils/logger.ts
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info', // Nível de log padrão: 'info'
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }), // Formata o nível para maiúsculas
  },
  timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
  // Configuração para transporte de logs (opcional, para enviar para serviços externos)
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty', // Usado para formatar logs no console durante o desenvolvimento
    options: {
      colorize: true,
    },
  } : undefined,
});

// Em produção, você pode querer um transporte diferente, como para um serviço de log centralizado
// if (process.env.NODE_ENV === 'production') {
//   logger.transport = {
//     target: '@logtail/pino', // Exemplo de transporte para Logtail
//     options: {
//       source: 'seu-source-aqui',
//       token: process.env.LOGTAIL_TOKEN,
//     },
//   };
// }

export { logger };
