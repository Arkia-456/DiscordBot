import {
	ApplicationCommandOptionType,
	ChatInputCommandInteraction,
	InteractionReplyOptions,
} from 'discord.js';
import { ISubcommand } from '../../../core/bot/commands/ISubcommand';
import { Subcommand } from '../../../core/bot/commands/Subcommand';
import { BotRecipe } from '../BotRecipe';
import logger from '../../../core/utils/logger/Logger';
import { ApplicationError } from '../../../core/utils/error/ApplicationError';
import {
	adjectives,
	animals,
	colors,
	uniqueNamesGenerator,
} from 'unique-names-generator';

async function execute(interaction: ChatInputCommandInteraction) {
	const channel = interaction.channel;
	const nextMenuOption = interaction.options.getBoolean('next-week');
	if (channel) {
		try {
			const messageOptions: InteractionReplyOptions =
				await BotRecipe.getWeeklyMenuMessage(nextMenuOption ?? false);
			await interaction.reply(messageOptions);
		} catch (error) {
			if (error instanceof ApplicationError) {
				logger.error(error.message, error.error);
			} else {
				logger.error('Unexpected error occurred', error);
			}
			const code = uniqueNamesGenerator({
				dictionaries: [adjectives, colors, animals],
				separator: '-',
			});
			await interaction.reply(
				`Une erreur est survenue lors de l'exécution de ta commande.\nIdentifiant de l'erreur : ${code}`,
			);
		}
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
