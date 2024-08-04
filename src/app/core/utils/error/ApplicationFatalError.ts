import { ApplicationError, ApplicationErrorOptions } from './ApplicationError';

export class ApplicationFatalError extends ApplicationError {
	constructor(options: ApplicationErrorOptions) {
		super(options);
	}
}