import { Client } from 'discord.js';
import Intents from './Intents';
import { ApplicationFatalError } from '../utils/error/ApplicationFatalError';
import logger from '../utils/logger/Logger';
import { EventManager } from './events/EventManager';
import { CommandManager } from './interactions/commands/CommandManager';

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
		logger.info('Initializing bot...');
		await CommandManager.register();
		await EventManager.register(this.client);
		logger.info('✔ Bot initialized successfully');
	}

	/**
	 * Get bot token and log in client
	 */
	public async login() {
		logger.info('Logging bot...');
		const botToken = process.env.BOT_TOKEN;
		if (!botToken) {
			throw new ApplicationFatalError({ message: 'Missing bot token' });
		}
		try {
			await this.client.login(botToken);
		} catch (error) {
			throw new ApplicationFatalError({
				message: 'Bot login failed',
				error: error,
			});
		}
		logger.info('✔ Bot logged successfully');
	}

	/**
	 * Destroy client
	 */
	public destroy() {
		return this.client.destroy();
	}
}
