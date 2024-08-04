export interface ApplicationErrorOptions {
	message?: string,
	error?: unknown
}

export class ApplicationError extends Error {
	public error: unknown;

	constructor(options: ApplicationErrorOptions) {
		super(options.message);
		this.error = options.error;
	}
}