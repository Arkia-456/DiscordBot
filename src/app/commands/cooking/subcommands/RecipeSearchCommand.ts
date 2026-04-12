import {
	ApplicationCommandOptionType,
	ChatInputCommandInteraction,
} from 'discord.js';
import {
	adjectives,
	animals,
	colors,
	uniqueNamesGenerator,
} from 'unique-names-generator';
import logger from '../../../core/utils/logger/Logger';
import { BotRecipe } from '../BotRecipe';
import { ApplicationError } from '../../../core/utils/error/ApplicationError';
import { BadInputError } from '../../../core/utils/error/BadInputError';
import { RecipeSearchType } from '../RecipeSearchType';
import { ISubcommand } from '../../../core/bot/interactions/commands/ISubcommand';
import { Subcommand } from '../../../core/bot/interactions/commands/Subcommand';

async function execute(interaction: ChatInputCommandInteraction) {
	const interactionCode = uniqueNamesGenerator({
		dictionaries: [adjectives, colors, animals],
		separator: '-',
	});
	logger.info('Executing command', {
		interactionId: interactionCode,
		command: 'recette rechercher',
	});

	try {
		const titleInput = interaction.options.getString('nom');
		const ingredientInput = interaction.options.getString('ingrédient');

		if (!titleInput && !ingredientInput) {
			throw new BadInputError({
				error: 'NoSearchCriteriaError',
				message: 'At least one search criteria must be provided.',
			});
		}

		const search: RecipeSearchType[] = [
			...(titleInput
				? [{ displayKey: 'nom', key: 'title', value: titleInput }]
				: []),
			...(ingredientInput
				? [
						{
							displayKey: 'ingrédient',
							key: 'ingredient',
							value: ingredientInput,
						},
					]
				: []),
		];

		const recipes = await BotRecipe.searchRecipes(search);
		const replyOptions = BotRecipe.createReplyOptions(search, recipes);
		await interaction.reply(replyOptions);
	} catch (error) {
		if (error instanceof BadInputError) {
			if (error.error === 'NoSearchCriteriaError') {
				await interaction.reply(
					'Erreur de saisie : Au moins un critère de recherche doit être fourni.',
				);
				return;
			}
		} else if (error instanceof ApplicationError) {
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
			},
			{
				type: ApplicationCommandOptionType.String,
				name: 'ingrédient',
				description: "Nom de l'ingrédient",
				minLength: 3,
			},
		],
	},
).subcommandInfo;
