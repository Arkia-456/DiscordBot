export class Logger {
	static write(message: string, clearPreviousLine: boolean = false) {
		if (clearPreviousLine) {
			process.stdout.moveCursor(0, -1);
			process.stdout.clearLine(1);
			process.stdout.cursorTo(0);
		}
		process.stdout.write(`${message}\n`);
	}
}