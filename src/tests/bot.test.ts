import { afterAll, describe, expect, test } from '@jest/globals';
import { Client } from 'discord.js';
import { Bot } from '../app/core/bot/Bot';

describe('bot', () => {
	const bot = new Bot();

	describe('start up', () => {

		test('client should be Client type', () => {
			expect(bot.client).toBeInstanceOf(Client);
		});

		test('client should have Guilds intent', () => {
			expect(bot).toHaveProperty('client.options.intents.bitfield', 1);
		});

		test('should return bot token', async () => {
			const botToken = process.env.BOT_TOKEN;
			expect((await bot.login())).toBe(botToken);
		});
	});

	afterAll(() => {
		bot.destroy();
	});

});