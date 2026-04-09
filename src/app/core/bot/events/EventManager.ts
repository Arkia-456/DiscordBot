import { Client } from 'discord.js';
import path from 'path';
import logger from '../../utils/logger/Logger';
import { readdir } from 'fs/promises';
import { ApplicationFatalError } from '../../utils/error/ApplicationFatalError';

export class EventManager {
	/**
	 * Register client events
	 * @param client
	 */
	public static async register(client: Client) {
		logger.info('Registering events...');
		const eventsPath = path.join(__dirname, 'events');
		const eventFiles = [];
		try {
			const files = await readdir(eventsPath);
			eventFiles.push(...files.filter((f) => f.endsWith('.js')));
		} catch (error) {
			throw new ApplicationFatalError({ error: error });
		}

		let fileIndex = 0;
		logger.info(`Importing events: ${fileIndex}/${eventFiles.length}`);
		for (const eventFile of eventFiles) {
			try {
				await EventManager.registerEvent(
					path.join(eventsPath, eventFile),
					client,
				);
			} finally {
				fileIndex++;
				logger.info(`Importing events: ${fileIndex}/${eventFiles.length}`);
			}
		}
		logger.info('✔ Events registered successfully');
	}

	/**
	 * Register client event
	 * @param filePath
	 * @param client
	 */
	private static async registerEvent(filePath: string, client: Client) {
		const event = (await import(filePath)).default;
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		} else {
			client.on(event.name, (...args) => event.execute(...args));
		}
	}
}
