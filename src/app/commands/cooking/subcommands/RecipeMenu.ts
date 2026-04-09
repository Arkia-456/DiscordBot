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
	const currentMenuOption = interaction.options.getBoolean('current-week');
	if (channel) {
		const messageOptions: InteractionReplyOptions =
			await BotRecipe.getWeeklyMenuMessage(currentMenuOption ?? false);
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
				name: 'current-week',
				description:
					'Menu de la semaine en cours ? Si non, affiche le menu de la semaine prochaine',
			},
		],
	},
).subcommandInfo;
