import dotenv from 'dotenv';
import CookingDatabase from './app/core/database/cooking/CookingDatabase';

async function main() {
	try {
		dotenv.config();
		await new CookingDatabase().init();
	} catch (error) {
		console.log(error);
	}
}

main();