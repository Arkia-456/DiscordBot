import { Client, EmbedBuilder, TextBasedChannel } from 'discord.js';
import Intents from './Intents';
import { CommandManager } from './commands/CommandManager';
import { ApplicationFatalError } from '../utils/error/ApplicationFatalError';
import { Logger } from '../utils/logger/Logger';
import { EventManager } from './events/EventManager';
import { Menu } from '../database/cooking/models/Menu';
import { Tag } from '../database/cooking/models/Tag';
import { BotConstants } from './BotConstants';

/**
 * Manage the bot
 */
export class Bot {
	public readonly client: Client;

	constructor() {
		this.client = new Client({ intents: Intents });
	}

	/**
	 * Initialize bot with commands and events
	 */
	public async init() {
		Logger.write('Initializing bot...');
		await CommandManager.register();
		await EventManager.register(this.client);
		Logger.write('✔ Bot initialized successfully');
	}

	/**
	 * Get bot token and log in client
	 */
	public async login() {
		Logger.write('Logging bot...');
		const botToken = process.env.BOT_TOKEN;
		if (!botToken) {
			Logger.write('❌ Bot logging failed');
			throw new ApplicationFatalError({ message: 'Missing bot token' });
		}
		await this.client.login(botToken);
		Logger.write('✔ Bot logged successfully', true);
	}

	/**
	 * Destroy client
	 */
	public destroy() {
		return this.client.destroy();
	}

	public static async sendWeeklyMenu(channel: TextBasedChannel, force: boolean = false) {
		const icons: { [key: string]: string } = {
			Worldwide: '🌍',
			Végétarien: '🥬',
			Épicé: '🌶️',
			Rapide: '⏱️',
		};
		const menu = await Menu.getNextWeekMenu();
		if (!menu) return;
		if (menu.messageId && !force) {
			let existingMessage;
			try {
				existingMessage	= await channel.messages.fetch(menu.messageId);
			} catch (error) {
				/* empty */
			}
			if (existingMessage) return;
		}

		const recipes = menu.Recipes;

		const fields = recipes.map(recipe => {
			let icon: string = '';
			recipe.Tags?.forEach((tag: Tag) => {
				const i = icons[tag.name];
				if (i) icon += ` ${i}`;
			});
			return {
				name: '\u200B',
				value: `${recipe.name}\n${icon.trim()}`,
				inline: true,
			};
		});

		const embed = new EmbedBuilder()
			.setTitle('Menu de la semaine')
			.setColor(BotConstants.EMBEDS.COLORS.COOKING)
			.addFields(fields);

		const message = await channel.send({
			embeds: [embed],
		});

		console.log(message);

		if (!force) {
			await Menu.update(
				{
					messageId: message.id,
				},
				{
					where: {
						id: menu.id,
					},
				},
			);
		}
	}
}