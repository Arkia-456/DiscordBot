import { FindOptions, Op, WhereOptions } from 'sequelize';
import { Recipe } from '../../core/database/cooking/models/Recipe';
import { EmbedAuthorOptions, EmbedBuilder, EmbedFooterOptions } from 'discord.js';
import { BotConstants } from '../../core/bot/BotConstants';

export interface BotRecipeSearchOptions {
	nameSearchExpr: string | null;
}

export class BotRecipe {

	static readonly primaryColor = '#eba123';

	static searchRecipes(options: BotRecipeSearchOptions) {
		const findOptions: FindOptions = {};
		const whereOptions: WhereOptions = {};

		if (options.nameSearchExpr) {
			const orArray = options.nameSearchExpr.split(';');
			whereOptions.name = {
				[Op.or]: [],
			};
			orArray.forEach(orPredicate => {
				whereOptions.name[Op.or].push({
					[Op.and]: orPredicate.split(',').map(str => ({ [Op.like]: `%${str.trim()}%` })),
				});
			});
		}

		findOptions.where = whereOptions;
		return Recipe.findAll(findOptions);
	}

	static prepareReply(options: BotRecipeSearchOptions, recipes: Array<Recipe>) {
		const count = recipes.length;
		let partialCount = 0;
		let recipeList = '';

		if (count) {
			recipes.forEach(recipe => {
				const str = `\n- ${recipe.toJSON().name}`;
				if (recipeList.length + str.length < BotConstants.EMBEDS.LIMITS.DESCRIPTION_LENGTH) {
					recipeList += str;
					partialCount++;
				}
			});
		}

		const header: EmbedAuthorOptions = {
			name: `Résultats de la recherche (${partialCount < count ? partialCount + '/' + count : count})`,
		};

		const footer: EmbedFooterOptions = {
			text: `${options.nameSearchExpr ? `nom : ${options.nameSearchExpr}` : ''}`,
		};

		const embed = new EmbedBuilder()
			.setAuthor(header)
			.setColor(BotRecipe.primaryColor);
		if (recipeList) embed.setDescription(recipeList);
		if (footer.text) embed.setFooter(footer);

		return {
			embeds: [embed],
		};
	}

}