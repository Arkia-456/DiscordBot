import dotenv from 'dotenv';
import CookingDatabase from './app/core/database/cooking/CookingDatabase';
import { importRecipes } from './data/import';

async function main() {
	try {
		dotenv.config();
		await new CookingDatabase().init();
		await importRecipes();
	} catch (error) {
		console.log(error);
	}
}

main();