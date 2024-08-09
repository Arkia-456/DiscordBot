import { FindOptions, Op, WhereOptions } from 'sequelize';
import { Recipe } from '../../core/database/cooking/models/Recipe';
import { EmbedBuilder, EmbedFooterOptions } from 'discord.js';
import { BotConstants } from '../../core/bot/BotConstants';
import { Step } from '../../core/database/cooking/models/Step';
import { Yield } from '../../core/database/cooking/models/Yield';
import { YieldIngredient } from '../../core/database/cooking/models/YieldIngredient';
import Ingredient from '../../core/database/cooking/models/Ingredient';

export interface BotRecipeSearchOptions {
	nameSearchExpr: string | null;
}

export class BotRecipe {

	static readonly primaryColor = '#eba123';

	static searchRecipes(options: BotRecipeSearchOptions) {
		const findOptions: FindOptions = {
			include: [
				{
					model: Yield,
					include: [
						{
							model: YieldIngredient,
							include: [Ingredient],
						},
					],
				},
				Step,
			],
			order: [
				[Yield, 'yields', 'ASC'],
				[Step, 'index', 'ASC'],
			],
		};
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

		if (count === 1) {
			return {
				embeds: [BotRecipe.prepareReplySingleRecipe(recipes[0])],
			};
		}

		const header = `Résultats de la recherche (${partialCount < count ? partialCount + '/' + count : count})`;

		const footer: EmbedFooterOptions = {
			text: `${options.nameSearchExpr ? `nom : ${options.nameSearchExpr}` : ''}`,
		};

		const embed = new EmbedBuilder()
			.setTitle(header)
			.setColor(BotRecipe.primaryColor);
		if (recipeList) embed.setDescription(recipeList);
		if (footer.text) embed.setFooter(footer);

		return {
			embeds: [embed],
		};
	}

	private static prepareReplySingleRecipe(recipe: Recipe) {
		const embed = new EmbedBuilder()
			.setTitle(recipe.name)
			.setDescription(`${recipe.headline}\r\n${recipe.description}\r\nPrep time : ${recipe.preparationTime}\nTotal time : ${recipe.totalTime}`)
			.setColor(BotRecipe.primaryColor);

		if (recipe.Yields) {
			const yield2 = recipe.Yields.find(y => y.yields === 2);
			if (yield2) {

				const formatDecimal = (number: number) => {
					const fractions: { [key: number]: string } = {
						0.8: '⅘',
						0.75: '¾',
						0.66: '⅔',
						0.6: '⅗',
						0.5: '½',
						0.4: '⅖',
						0.33: '⅓',
						0.25: '¼',
						0.2: '⅕',
					};
					return fractions[number] ?? String(number);
				};

				const formatYieldIngredient = (yieldIngredient: YieldIngredient) => {
					if (yieldIngredient.amount === null) {
						return `${yieldIngredient.Ingredient?.name ?? ''} ${yieldIngredient.unit ?? ''}`.trim();
					}
					return `${formatDecimal(parseFloat(String(yieldIngredient.amount))) ?? ''} ${yieldIngredient.unit ?? ''} ${yieldIngredient.Ingredient?.name ?? ''}`.trim();
				};

				const yieldIngredients = yield2.YieldIngredients?.map(yi => formatYieldIngredient(yi));

				embed.addFields([
					{
						name: `Pour ${yield2?.yields} personnes`,
						value: yieldIngredients?.map((yi, index) => {
							if (!(index % 2)) return yi;
						}).filter(Boolean).join('\n') ?? '',
						inline: true,
					},
					{
						name: '\u200B',
						value: yieldIngredients?.map((yi, index) => {
							if (index % 2) return yi;
						}).filter(Boolean).join('\n') ?? '',
						inline: true,
					},
				]);
			}
		}

		if (recipe.Steps) {
			const steps = recipe.Steps.map(step => ({
				name: '\u200B',
				value: `${step.instructions}`,
			}));
			embed.addFields(steps);
		}

		return embed;
	}

}