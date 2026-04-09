import { EmbedBuilder } from 'discord.js';
import { BotConstants } from '../../core/bot/BotConstants';
import { GraphQLResponse } from '../../api/graphql/GraphQLTypes';
import { RecipeModel } from '../../cooking/models/RecipeModel';
import { RecipesModel } from '../../cooking/models/RecipesModel';
import { ApplicationError } from '../../core/utils/error/ApplicationError';
import { MathUtils } from '../../core/utils/MathUtils';
import { RecipeIngredientModel } from '../../cooking/models/RecipeIngredientModel';
import { EmbedUtils } from '../../core/utils/EmbedUtils';
import { DateUtils } from '../../core/utils/DateUtils';
import { MenusGraphQLData } from '../../cooking/models/MenusGraphQLData';
import { MenuModel } from '../../cooking/models/MenuModel';

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

	public static async getWeeklyMenuMessage(currentWeek?: boolean) {
		const menu = await BotRecipe.getWeeklyMenu(currentWeek);
		if (!menu) {
			const embed = new EmbedBuilder()
				.setDescription(
					`Aucun menu trouvé pour ${currentWeek ? 'cette semaine' : 'la semaine prochaine'}.`,
				)
				.setColor(BotConstants.EMBEDS.COLORS.COOKING);
			return { embeds: [embed] };
		}
		return BotRecipe.buildWeeklyMenuMessage(menu);
	}

	private static buildWeeklyMenuMessage(menu: MenuModel) {
		const iconsDictionnary: { [key: string]: string } = {
			Worldwide: '🌍',
			Végétarien: '🥬',
			Épicé: '🌶️',
			Rapide: '⏱️',
		};

		const chunkSize = BotConstants.EMBEDS.LIMITS.FIELDS_NUMBER;

		const formattedDate = new Intl.DateTimeFormat('fr-FR', {
			dateStyle: 'short',
		}).format(new Date(menu.date));

		const embeds = BotRecipe.splitEvently(menu.recipes, chunkSize).map(
			(recipesChunk, index, array) => {
				const fields = recipesChunk.map((recipe) => {
					let icons: string = '';
					recipe.tags?.forEach((tag) => {
						const icon = iconsDictionnary[tag.slug];
						if (icon) icons += ` ${icon}`;
					});
					return {
						name: '\u200B',
						value: `${recipe.title}\n${icons.trim()}`,
						inline: true,
					};
				});
				return new EmbedBuilder()
					.setTitle(
						`Menu de la semaine du ${formattedDate}${menu.recipes.length > chunkSize ? ` (${index + 1}/${array.length})` : ''}`,
					)
					.setColor(BotConstants.EMBEDS.COLORS.COOKING)
					.addFields(fields);
			},
		);

		return {
			embeds: embeds,
		};
	}

	private static splitEvently(items: Array<RecipeModel>, maxPerEmbed: number) {
		const total = items.length;
		const embedsCount = Math.ceil(total / maxPerEmbed);
		const baseSize = Math.floor(total / embedsCount);
		const remainder = total % embedsCount;
		const result = [];
		let index = 0;

		for (let i = 0; i < embedsCount; i++) {
			const size = baseSize + (i < remainder ? 1 : 0);
			result.push(items.slice(index, index + size));
			index += size;
		}
		return result;
	}

	private static async getWeeklyMenu(currentWeek: boolean = false) {
		const menu = currentWeek
			? await BotRecipe.getCurrentWeekMenu()
			: await BotRecipe.getNextWeekMenu();
		if (!menu) return null;
		return menu;
	}

	private static getCurrentWeekMenu(startDate?: Date) {
		const date = startDate ? new Date(startDate) : new Date();
		const monday = DateUtils.getPreviousNamedDay('monday', date);
		return BotRecipe.getWeekMenu(monday);
	}

	private static getNextWeekMenu(startDate?: Date) {
		const date = startDate ? new Date(startDate) : new Date();
		const monday = DateUtils.getNextNamedDay('monday', date);
		return BotRecipe.getWeekMenu(monday);
	}

	private static async getWeekMenu(startDate: Date) {
		const query = `
			query Menus {
				menus(where: { date: { eq: "${DateUtils.formatToIsoDateOnly(startDate)}" } }) {
					date
					recipes {
						title
					}
				}
			}
		`;

		const resp = await fetch(BotConstants.COOKING_API_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query }),
		});

		const data: GraphQLResponse<MenusGraphQLData> = await resp.json();

		if (data.errors) {
			throw new ApplicationError('GraphQL query failed', data.errors);
		}
		return data.data?.menus[0];
	}
}
