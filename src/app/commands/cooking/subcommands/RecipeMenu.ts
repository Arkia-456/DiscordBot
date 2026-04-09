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
	const interactionCode = uniqueNamesGenerator({
		dictionaries: [adjectives, colors, animals],
		separator: '-',
	});
	logger.info('Executing command', {
		interactionId: interactionCode,
		command: 'recette menu',
	});

	const channel = interaction.channel;
	const nextMenuOption = interaction.options.getBoolean('next-week');
	if (channel) {
		try {
			const messageOptions: InteractionReplyOptions =
				await BotRecipe.getWeeklyMenuMessage(nextMenuOption ?? false);
			await interaction.reply(messageOptions);
		} catch (error) {
			if (error instanceof ApplicationError) {
				logger.error(error.message, {
					interactionId: interactionCode,
					error:
						error.error instanceof Error
							? {
									name: error.error.name,
									cause: error.error.cause,
									message: error.error.message,
									stack: error.error.stack,
								}
							: error.error,
				});
			} else {
				logger.error('Unexpected error occurred', {
					interactionId: interactionCode,
					error,
				});
			}
			await interaction.reply(
				`Une erreur est survenue lors de l'exécution de ta commande.\nIdentifiant de ta commande : ${interactionCode}`,
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
