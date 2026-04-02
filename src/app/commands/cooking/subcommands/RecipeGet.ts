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
import { BotRecipe } from '../BotRecipe';

async function execute(interaction: ChatInputCommandInteraction) {
	const search = interaction.options.getString('nom', true);
	try {
		const recipes = await BotRecipe.searchRecipes(search);
		const replyOptions = BotRecipe.createReplyOptions(search, recipes);
		await interaction.reply(replyOptions);
	} catch (error) {
		const code = uniqueNamesGenerator({
			dictionaries: [adjectives, colors, animals],
			separator: '-',
		});
		console.log(code);
		console.log(error);
		await interaction.reply(
			`Une erreur est survenue lors de l'exécution de ta commande.\nIdentifiant de l'erreur : ${code}`,
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
