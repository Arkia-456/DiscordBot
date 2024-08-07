import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import { ISubcommand } from '../../../core/bot/commands/ISubcommand';
import { Subcommand } from '../../../core/bot/commands/Subcommand';
import { Recipe } from '../../../core/database/cooking/models/Recipe';
import { FindOptions, Op, WhereOptions } from 'sequelize';

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
	let answer = '';

	if (count) {
		const list = recipes.map(recipe => recipe.toJSON().name);
		answer = `Voici la liste des recettes correspondant à ta recherche "${nameSearchExpr}" : (${count})`;
		list.forEach(recipe => answer += `\n- ${recipe}`);
	} else {
		answer = `Je n'ai trouvé aucune recette correspondant à ta recherche "${nameSearchExpr}"`;
	}

	await interaction.reply(answer);
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