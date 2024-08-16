import { HexColorString } from 'discord.js';

export abstract class BotConstants {
	static readonly EMBEDS = {
		LIMITS: {
			DESCRIPTION_LENGTH: 4096,
		},
		COLORS: {
			COOKING: '#eba123' as HexColorString,
		},
	};
}