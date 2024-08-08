import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedAuthorOptions, EmbedBuilder } from 'discord.js';
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
	let partialCount = 0;
	const baseAnswer = `${nameSearchExpr ? `nom : ${nameSearchExpr}` : ''}`;
	let recipeList = '';

	const embedHeader: EmbedAuthorOptions = {
		name: '',
	};

	if (count) {
		const list = recipes.map(recipe => recipe.toJSON().name);
		list.forEach(recipe => {
			const str = `\n- ${recipe}`;
			if (recipeList.length + str.length < 4096) {
				recipeList += str;
				partialCount++;
			}
		});
		embedHeader.name = `Résultats de la recherche (${partialCount < count ? partialCount + '/' + count : count})`;
	} else {
		embedHeader.name = 'Résultats de la recherche (0)';
	}

	const embed = new EmbedBuilder();
	if (embedHeader.name) embed.setAuthor(embedHeader);
	if (recipeList) embed.setDescription(recipeList);
	embed.setFooter({ text: baseAnswer })
		.setColor('#eba123');
	const replyOptions = {
		embeds: [embed],
	};

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