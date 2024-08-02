import dotenv from 'dotenv';
import Bot from './app/core/bot/Bot';

async function main() {
	try {
		dotenv.config();
		new Bot().login();
	} catch (error) {
		console.log(error);
	}
}

main();