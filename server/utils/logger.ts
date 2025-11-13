import winston from "winston";

const isDevelopment = process.env.NODE_ENV === "development";

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development (more readable)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Create logger instance
export const logger = winston.createLogger({
  level: isDevelopment ? "debug" : "info",
  format: logFormat,
  defaultMeta: { service: "sora-prompt-genie" },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: isDevelopment ? consoleFormat : logFormat,
    }),
  ],
});

// Add file transports in production
if (!isDevelopment) {
  // Ensure logs directory exists (will be created by winston if it doesn't exist)
  const logsDir = "./logs";
  
  // Error log - only errors and above
  logger.add(
    new winston.transports.File({
      filename: `${logsDir}/error.log`,
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: logFormat,
    })
  );
  
  // Combined log - all logs
  logger.add(
    new winston.transports.File({
      filename: `${logsDir}/combined.log`,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: logFormat,
    })
  );
}

export default logger;

