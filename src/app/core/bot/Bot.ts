import { Client } from 'discord.js';
import 'dotenv/config';
import * as Intents from './Intents';

export class Bot {
	public readonly client: Client;

	constructor() {
		const intents = Intents.list;
		this.client = new Client({
			intents: intents,
		});
	}

	public login() {
		return this.client.login(process.env.BOT_TOKEN);
	}

	public destroy() {
		this.client.destroy();
	}
}