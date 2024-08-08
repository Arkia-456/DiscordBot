import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import { ISubcommand } from '../../../core/bot/commands/ISubcommand';
import { Subcommand } from '../../../core/bot/commands/Subcommand';
import { adjectives, animals, colors, uniqueNamesGenerator } from 'unique-names-generator';
import { BotRecipe } from '../BotRecipe';

async function execute(interaction: ChatInputCommandInteraction) {
	const nameSearchExpr = interaction.options.getString('nom');
	const searchOptions = { nameSearchExpr: nameSearchExpr };
	const recipes = await BotRecipe.searchRecipes(searchOptions);

	const replyOptions = BotRecipe.prepareReply(searchOptions, recipes);

	try {
		await interaction.reply(replyOptions);
	} catch (error) {
		const code = uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals], separator: '-' });
		console.log(code);
		console.log(error);
		await interaction.reply(`Une erreur est survenue lors de l'exécution de ta commande.\nIdentifiant de l'erreur : ${code}`);
	}
}

export const subcommandInfo: ISubcommand = new Subcommand(
	'rechercher',
	'Recherche une recette. Utilise `,` pour rechercher tous les termes et `;` pour les séparer.',
	execute,
	{
		options: [
			{
				type: ApplicationCommandOptionType.String,
				name: 'nom',
				description: 'Nom de la recette',
				minLength: 3,
			},
		],
	},
).subcommandInfo;