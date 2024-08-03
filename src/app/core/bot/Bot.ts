import { Client } from 'discord.js';
import Intents from './Intents';
import { CommandManager } from './commands/CommandManager';
import { ApplicationFatalError } from '../utils/error/ApplicationFatalError';
import { Logger } from '../utils/logger/Logger';
import { EventManager } from './events/EventManager';

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
		await CommandManager.register(this.client);
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
}