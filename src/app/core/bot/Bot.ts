import { Client } from 'discord.js';
import Intents from './Intents';

export default class Bot {
	public readonly client: Client;
	constructor() {
		this.client = new Client({ intents: Intents });
	}

	public init() {
		throw new Error('Method not implemented.');
	}

	public login() {
		const botToken = process.env.BOT_TOKEN;
		if (!botToken) {
			throw new Error('Error during bot login: Missing bot token');
		}
		return this.client.login(process.env.BOT_TOKEN);
	}
}