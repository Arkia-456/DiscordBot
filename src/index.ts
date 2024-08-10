import dotenv from 'dotenv';
import CookingDatabase from './app/core/database/cooking/CookingDatabase';
import { Bot } from './app/core/bot/Bot';
import { ApplicationFatalError } from './app/core/utils/error/ApplicationFatalError';
import cron from 'node-cron';
import { Menu } from './app/core/database/cooking/models/Menu';


async function main() {
	dotenv.config();
	const bot = new Bot();
	try {
		await new CookingDatabase().init();
		await bot.init();
		await bot.login();

		// At init, check if menu exist
		if (!(await Menu.getNextWeekMenu())) await Menu.createWeekMenu();

		// Generate weekly menu
		const schedule = '* * 8 * * Thursday';
		const menuTask = cron.schedule(schedule, async () => {
			if (!(await Menu.getNextWeekMenu())) await Menu.createWeekMenu();
		});
		menuTask.start();

		const guildIds = process.env.PRIVATE_GUILD_IDS;
		if (guildIds) {
			const [guildId] = guildIds.split(',');
			if (guildId) {
				const guild = await bot.client.guilds.fetch(guildId);
				if (guild) {
					const channels = await guild.channels.fetch();
					const channel = channels.find(c => c?.name === 'menus');
					if (channel && channel.isTextBased()) {
						await Bot.sendWeeklyMenu(channel);
					}
				}
			}
		}

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