export interface BadInputErrorOptions {
	message?: string;
	error?: unknown;
}

export class BadInputError extends Error {
	public error: unknown;

	constructor(message: string, error?: unknown);
	constructor(options: BadInputErrorOptions);

	constructor(
		messageOrOptions: string | BadInputErrorOptions,
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
