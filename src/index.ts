import dotenv from 'dotenv';
import CookingDatabase from './app/core/database/cooking/CookingDatabase';
import { importRecipes } from './data/import';
import { Bot } from './app/core/bot/Bot';
import { ApplicationFatalError } from './app/core/utils/error/ApplicationFatalError';

async function main() {
	dotenv.config();
	const bot = new Bot();
	try {
		await new CookingDatabase().init();
		await importRecipes();
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