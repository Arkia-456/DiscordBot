import { EmbedBuilder } from 'discord.js';
import { BotConstants } from '../../core/bot/BotConstants';
import { GraphQLResponse } from '../../api/graphql/GraphQLTypes';
import { RecipeModel } from '../../cooking/models/RecipeModel';
import { RecipesModel } from '../../cooking/models/RecipesModel';
import { ApplicationError } from '../../core/utils/error/ApplicationError';
import { MathUtils } from '../../core/utils/MathUtils';
import { RecipeIngredientModel } from '../../cooking/models/RecipeIngredientModel';
import { EmbedUtils } from '../../core/utils/EmbedUtils';

export interface BotRecipeSearchOptions {
	nameSearchExpr: string | null;
}

export class BotRecipe {
	static {
		// Allow self-signed certificates for development
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
	}

	static async searchRecipes(search: string) {
		const query = `
			query Recipes {
				recipes(where: { title: { contains: "${search}" } }) {
					id
					title
					recipeIngredients {
						quantity
						unit
						index
						ingredient {
							name
						}
					}
					recipeInstructions {
						index
						instruction
					}
				}
			}
		`;

		const resp = await fetch(BotConstants.COOKING_API_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query }),
		});

		const data: GraphQLResponse<RecipesModel> = await resp.json();

		if (data.errors) {
			throw new ApplicationError('GraphQL query failed', data.errors);
		}
		return data.data?.recipes ?? [];
	}

	static createReplyOptions(search: string, recipes: Array<RecipeModel>) {
		const count = recipes.length;

		if (count === 1) {
			return {
				embeds: [BotRecipe.createReplySingleRecipe(recipes[0])],
			};
		}

		return {
			embeds: [BotRecipe.createReplyMultipleRecipes(search, recipes)],
		};
	}

	private static createReplyMultipleRecipes(
		search: string,
		recipes: Array<RecipeModel>,
	) {
		const count = recipes.length;
		const headerBaseText = 'Résultats de la recherche ({count})';

		const worstCaseHeader = EmbedUtils.createHeader({
			text: headerBaseText.replace('{count}', `${count}/${count}`),
			ellipsis: true,
		});

		const footer = EmbedUtils.createFooter({
			text: `Recherche : ${search}`,
			ellipsis: true,
		});

		const descriptionBudget = Math.min(
			BotConstants.EMBEDS.LIMITS.DESCRIPTION_LENGTH,
			BotConstants.EMBEDS.LIMITS.EMBED_LENGTH -
				worstCaseHeader.length -
				footer.text.length,
		);

		let partialCount = 0;
		let recipeList = '';
		const separator = '\n-';

		for (const recipe of recipes) {
			const addition = `${separator} ${recipe.title}`;
			if (recipeList.length + addition.length > descriptionBudget) break;

			recipeList += addition;
			partialCount++;
		}

		const headerText = EmbedUtils.createHeader({
			text: headerBaseText.replace(
				'{count}',
				`${partialCount < count ? `${partialCount}/` : ''}${count}`,
			),
			ellipsis: true,
		});

		const embed = new EmbedBuilder()
			.setTitle(headerText)
			.setColor(BotConstants.EMBEDS.COLORS.COOKING)
			.setFooter(footer);
		if (recipeList) embed.setDescription(recipeList);

		return embed;
	}

	private static sortByIndex(ingredients: Array<RecipeIngredientModel>) {
		ingredients.sort((a, b) => {
			if (a.index == null && b.index == null) return 0;
			if (a.index == null) return 1;
			if (b.index == null) return -1;
			return a.index - b.index;
		});
	}

	private static createReplySingleRecipe(recipe: RecipeModel) {
		const embed = new EmbedBuilder()
			.setTitle(recipe.title)
			.setColor(BotConstants.EMBEDS.COLORS.COOKING);

		BotRecipe.sortByIndex(recipe.recipeIngredients);
		const ingredients = recipe.recipeIngredients.map((ri) =>
			`${ri.quantity ? MathUtils.formatDecimal(ri.quantity) : ''} ${ri.unit ?? ''} ${ri.ingredient.name}`.trim(),
		);

		embed.addFields([
			{
				name: 'Ingrédients',
				value: ingredients
					.map((i, index) => {
						if (!(index % 2)) return i;
					})
					.filter(Boolean)
					.join('\n'),
				inline: true,
			},
			{
				name: '\u200B',
				value: ingredients
					.map((i, index) => {
						if (index % 2) return i;
					})
					.filter(Boolean)
					.join('\n'),
				inline: true,
			},
		]);

		const instructions = recipe.recipeInstructions.map((instruction) => ({
			name: '\u200B',
			value: instruction.instruction,
		}));
		embed.addFields(instructions);

		return embed;
	}
}
