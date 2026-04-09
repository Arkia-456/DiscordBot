import winston from 'winston';
import 'winston-daily-rotate-file';

class Logger {
	private static instance: Logger;
	private logger: winston.Logger;

	private constructor() {
		this.logger = winston.createLogger({
			level: 'info',
			format: winston.format.combine(
				winston.format.timestamp(),
				winston.format.json(),
			),
			transports: [
				new winston.transports.DailyRotateFile({
					filename: 'logs/%DATE%.log',
					datePattern: 'YYYY-MM-DD',
					maxFiles: '30d',
					maxSize: '20m',
				}),
				new winston.transports.Console(),
			],
		});
	}

	static getInstance() {
		if (!Logger.instance) {
			Logger.instance = new Logger();
		}
		return Logger.instance;
	}

	info(message: string, meta?: unknown): void {
		this.logger.info(message, meta);
	}

	warn(message: string, meta?: unknown): void {
		this.logger.warn(message, meta);
	}

	error(message: string, meta?: unknown): void {
		this.logger.error(message, meta);
	}

	debug(message: string, meta?: unknown): void {
		this.logger.debug(message, meta);
	}
}

export default Logger.getInstance();
