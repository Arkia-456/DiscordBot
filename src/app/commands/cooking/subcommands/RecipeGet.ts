import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import { ISubcommand } from '../../../core/bot/commands/ISubcommand';
import { Subcommand } from '../../../core/bot/commands/Subcommand';
import { Recipe } from '../../../core/database/cooking/models/Recipe';
import { FindOptions, Op, WhereOptions } from 'sequelize';
import { adjectives, animals, colors, uniqueNamesGenerator } from 'unique-names-generator';

async function execute(interaction: ChatInputCommandInteraction) {
	const nameSearchExpr = interaction.options.getString('nom');

	const whereOptions: WhereOptions = {};
	const findOptions: FindOptions = {
		attributes: ['name'],
	};

	if (nameSearchExpr) {
		const orArray = nameSearchExpr.split(';');
		whereOptions.name = {
			[Op.or]: [],
		};
		if (orArray.length) {
			orArray.forEach(orPredicate => {
				whereOptions.name[Op.or].push({
					[Op.and]: orPredicate.split(',').map(str => {
						return {
							[Op.like]: `%${str.trim()}%`,
						};
					}),
				});
			});
		}
	}

	findOptions.where = whereOptions;

	const recipes = await Recipe.findAll(findOptions);

	const count = recipes.length;
	let replyStr = '';

	if (count) {
		const list = recipes.map(recipe => recipe.toJSON().name);
		let partialCount = 0;
		const baseAnswer = `Voici la liste des recettes correspondant à ta recherche "${nameSearchExpr}" :`;
		let recipeList = '';
		list.forEach(recipe => {
			const str = `\n- ${recipe}`;
			if (baseAnswer.length + recipeList.length + str.length < 1900) {
				recipeList += str;
				partialCount++;
			}
		});
		replyStr = `${baseAnswer} (${partialCount < count ? partialCount + '/' + count : count})${recipeList}`;
	} else {
		replyStr = `Je n'ai trouvé aucune recette correspondant à ta recherche "${nameSearchExpr}"`;
	}

	try {
		await interaction.reply(replyStr);
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