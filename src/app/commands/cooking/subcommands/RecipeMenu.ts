import {
	ApplicationCommandOptionType,
	ChatInputCommandInteraction,
	InteractionReplyOptions,
} from 'discord.js';
import { ISubcommand } from '../../../core/bot/commands/ISubcommand';
import { Subcommand } from '../../../core/bot/commands/Subcommand';
import { BotRecipe } from '../BotRecipe';

async function execute(interaction: ChatInputCommandInteraction) {
	const channel = interaction.channel;
	const nextMenuOption = interaction.options.getBoolean('next-week');
	if (channel) {
		const messageOptions: InteractionReplyOptions =
			await BotRecipe.getWeeklyMenuMessage(nextMenuOption ?? false);
		await interaction.reply(messageOptions);
	}
}

export const subcommandInfo: ISubcommand = new Subcommand(
	'menu',
	'Affiche le menu de la semaine',
	execute,
	{
		options: [
			{
				type: ApplicationCommandOptionType.Boolean,
				name: 'next-week',
				description:
					'Menu de la semaine prochaine ? Si non, affiche le menu de la semaine en cours',
			},
		],
	},
).subcommandInfo;
