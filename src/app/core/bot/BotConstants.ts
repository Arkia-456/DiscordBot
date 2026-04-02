import { HexColorString } from 'discord.js';

export abstract class BotConstants {
	static readonly EMBEDS = {
		LIMITS: {
			DESCRIPTION_LENGTH: 4096,
			EMBED_LENGTH: 6000,
			FOOTER_LENGTH: 2048,
			TITLE_LENGTH: 256,
		},
		COLORS: {
			COOKING: '#eba123' as HexColorString,
		},
	};
	static get COOKING_API_URL() {
		return process.env.COOKING_API_URL || '';
	}
}
