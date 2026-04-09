import {
	ApplicationCommandOptionType,
	ChatInputCommandInteraction,
} from 'discord.js';
import { ISubcommand } from '../../../core/bot/commands/ISubcommand';
import { Subcommand } from '../../../core/bot/commands/Subcommand';
import {
	adjectives,
	animals,
	colors,
	uniqueNamesGenerator,
} from 'unique-names-generator';
import logger from '../../../core/utils/logger/Logger';
import { BotRecipe } from '../BotRecipe';
import { ApplicationError } from '../../../core/utils/error/ApplicationError';

async function execute(interaction: ChatInputCommandInteraction) {
	const interactionCode = uniqueNamesGenerator({
		dictionaries: [adjectives, colors, animals],
		separator: '-',
	});
	logger.info('Executing command', {
		interactionId: interactionCode,
		command: 'recette rechercher',
	});

	const search = interaction.options.getString('nom', true);

	try {
		const recipes = await BotRecipe.searchRecipes(search);
		const replyOptions = BotRecipe.createReplyOptions(search, recipes);
		await interaction.reply(replyOptions);
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

export const subcommandInfo: ISubcommand = new Subcommand(
	'rechercher',
	'Recherche une recette.',
	execute,
	{
		options: [
			{
				type: ApplicationCommandOptionType.String,
				name: 'nom',
				description: 'Nom de la recette',
				minLength: 3,
				required: true,
			},
		],
	},
).subcommandInfo;
