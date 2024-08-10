import { ChatInputCommandInteraction } from 'discord.js';
import { ISubcommand } from '../../../core/bot/commands/ISubcommand';
import { Subcommand } from '../../../core/bot/commands/Subcommand';
import { Bot } from '../../../core/bot/Bot';

async function execute(interaction: ChatInputCommandInteraction) {
	const channel = interaction.channel;
	if (channel) await Bot.sendWeeklyMenu(channel, true);
}

export const subcommandInfo: ISubcommand = new Subcommand(
	'menu',
	'Affiche le menu de la semaine',
	execute,
).subcommandInfo;