import { EmbedFooterOptions } from 'discord.js';
import { BotConstants } from '../bot/BotConstants';
import { StringUtils } from './StringUtils';

export abstract class EmbedUtils {
	public static createHeader({
		text,
		limit,
		ellipsis,
	}: {
		text: string;
		limit?: number;
		ellipsis?: boolean;
	}) {
		return StringUtils.truncate(
			text,
			limit ?? BotConstants.EMBEDS.LIMITS.TITLE_LENGTH,
			ellipsis,
		);
	}

	public static createFooter({
		text,
		limit,
		ellipsis,
	}: {
		text: string;
		limit?: number;
		ellipsis?: boolean;
	}) {
		const footerText = StringUtils.truncate(
			text,
			limit ?? BotConstants.EMBEDS.LIMITS.FOOTER_LENGTH,
			ellipsis,
		);
		return { text: footerText } as EmbedFooterOptions;
	}
}
