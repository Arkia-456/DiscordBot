import dotenv from 'dotenv';
import { Bot } from './app/core/bot/Bot';
import { ApplicationFatalError } from './app/core/utils/error/ApplicationFatalError';

async function main() {
	dotenv.config();
	const bot = new Bot();
	try {
		await bot.init();
		await bot.login();
	} catch (error) {
		if (error instanceof ApplicationFatalError) {
			await bot.destroy();
			throw error;
		} else {
			console.log(error);
		}
	}
}

main();