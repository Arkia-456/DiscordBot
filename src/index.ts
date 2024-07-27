import dotenv from 'dotenv';

async function main() {
	try {
		dotenv.config();
	} catch (error) {
		console.log(error);
	}
}

main();