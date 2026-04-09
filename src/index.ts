import dotenv from 'dotenv';
import { Bot } from './app/core/bot/Bot';
import { ApplicationFatalError } from './app/core/utils/error/ApplicationFatalError';
import cron from 'node-cron';
import { BotRecipe } from './app/commands/cooking/BotRecipe';
import logger from './app/core/utils/logger/Logger';

async function main() {
	dotenv.config();
	const bot = new Bot();
	try {
		await bot.init();
		await bot.login();

		// Generate weekly menu
		const schedule = '* * 8 30 * Sunday';
		const menuTask = cron.schedule(schedule, async () => {
			const guildIds = process.env.PRIVATE_GUILD_IDS;
			if (guildIds) {
				const [guildId] = guildIds.split(',');
				if (guildId) {
					const guild = await bot.client.guilds.fetch(guildId);
					if (guild) {
						const channels = await guild.channels.fetch();
						const channel = channels.find((c) => c?.name === 'menus');
						if (channel && channel.isTextBased()) {
							const messageOptions = await BotRecipe.getWeeklyMenuMessage();
							await channel.send(messageOptions);
						}
					}
				}
			}
		});
		menuTask.start();
	} catch (error) {
		if (error instanceof ApplicationFatalError) {
			await bot.destroy();
			logger.error('Fatal error during bot initialization', error);
			throw error;
		} else {
			logger.error('Unexpected error occurred', error);
		}
	}
}

main();
