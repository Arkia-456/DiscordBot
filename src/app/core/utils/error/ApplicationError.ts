export interface ApplicationErrorOptions {
	message?: string;
	error?: unknown;
}

export class ApplicationError extends Error {
	public error: unknown;

	constructor(message: string, error?: unknown);
	constructor(options: ApplicationErrorOptions);

	constructor(
		messageOrOptions: string | ApplicationErrorOptions,
		error?: unknown,
	) {
		if (typeof messageOrOptions === 'string') {
			super(messageOrOptions);
			this.error = error;
		} else {
			super(messageOrOptions.message);
			this.error = messageOrOptions.error;
		}
	}
}
