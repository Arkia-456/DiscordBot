import { Client, EmbedBuilder, TextBasedChannel } from 'discord.js';
import Intents from './Intents';
import { CommandManager } from './commands/CommandManager';
import { ApplicationFatalError } from '../utils/error/ApplicationFatalError';
import { Logger } from '../utils/logger/Logger';
import { EventManager } from './events/EventManager';
import { Menu } from '../database/cooking/models/Menu';
import { Tag } from '../database/cooking/models/Tag';
import { BotConstants } from './BotConstants';

interface MenuSendingOptions {
	publish?: boolean;
	current?: boolean;
}

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

	public static async getWeeklyMenu(channel: TextBasedChannel, options?: MenuSendingOptions) {
		const menu = options?.current ? await Menu.getCurrentWeekMenu() : await Menu.getNextWeekMenu();
		if (!menu) return null;
		if (menu.messageId && options?.publish) {
			let existingMessage;
			try {
				existingMessage	= await channel.messages.fetch(menu.messageId);
			} catch (error) {
				/* empty */
			}
			if (existingMessage) return;
		}

		return menu;
	}

	static async sendWeeklyMenu(channel: TextBasedChannel) {
		const menu = await Bot.getWeeklyMenu(channel, { publish: true });
		if (!menu) return;

		const messageOptions = Bot.buildWeeklyMenuMessage(menu);
		const message = await channel.send(messageOptions);

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

	static async getWeeklyMenuMessage(channel: TextBasedChannel, current?: boolean) {
		const menu = await Bot.getWeeklyMenu(channel, { current });
		if (!menu) return;
		return Bot.buildWeeklyMenuMessage(menu);
	}

	private static buildWeeklyMenuMessage(menu: Menu) {
		const icons: { [key: string]: string } = {
			Worldwide: '🌍',
			Végétarien: '🥬',
			Épicé: '🌶️',
			Rapide: '⏱️',
		};
		const fields = menu.Recipes.map(recipe => {
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
		const formattedDate = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short' }).format(new Date(menu.startDate));
		const embed = new EmbedBuilder()
			.setTitle(`Menu de la semaine du ${formattedDate}`)
			.setColor(BotConstants.EMBEDS.COLORS.COOKING)
			.addFields(fields);

		return {
			embeds: [embed],
		};
	}
}