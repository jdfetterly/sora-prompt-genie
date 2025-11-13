import { describe, it, expect } from 'vitest';
import winston from 'winston';

describe('logger utility', () => {
  it('should export a logger instance', async () => {
    // Dynamic import to ensure fresh module load
    const loggerModule = await import('../../../server/utils/logger');
    
    expect(loggerModule.logger).toBeDefined();
    expect(loggerModule.logger).toBeInstanceOf(winston.Logger);
  });

  it('should have default logger export', async () => {
    const loggerModule = await import('../../../server/utils/logger');
    
    expect(loggerModule.default).toBeDefined();
    expect(loggerModule.default).toBe(loggerModule.logger);
  });

  it('should have a valid log level', async () => {
    const loggerModule = await import('../../../server/utils/logger');
    const validLevels = ['error', 'warn', 'info', 'debug'];
    
    expect(validLevels).toContain(loggerModule.logger.level);
  });

  it('should have console transport configured', async () => {
    const loggerModule = await import('../../../server/utils/logger');
    const transports = loggerModule.logger.transports;
    
    const consoleTransport = transports.find(
      (t: winston.transport) => t instanceof winston.transports.Console
    );
    
    expect(consoleTransport).toBeDefined();
  });

  it('should log messages at different levels', async () => {
    const loggerModule = await import('../../../server/utils/logger');
    const logger = loggerModule.logger;
    
    // These should not throw
    expect(() => logger.error('Test error')).not.toThrow();
    expect(() => logger.warn('Test warning')).not.toThrow();
    expect(() => logger.info('Test info')).not.toThrow();
    expect(() => logger.debug('Test debug')).not.toThrow();
  });

  it('should have structured logging format', async () => {
    const loggerModule = await import('../../../server/utils/logger');
    const logger = loggerModule.logger;
    
    // Logger should accept metadata objects
    expect(() => {
      logger.info('Test message', { key: 'value', number: 123 });
    }).not.toThrow();
  });
});

