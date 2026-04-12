import {
	ActionRowBuilder,
	AnySelectMenuInteraction,
	EmbedBuilder,
	StringSelectMenuBuilder,
} from 'discord.js';
import { BotConstants } from '../../core/bot/BotConstants';
import { MathUtils } from '../../core/utils/MathUtils';
import { EmbedUtils } from '../../core/utils/EmbedUtils';
import { DateUtils } from '../../core/utils/DateUtils';
import { RecipeQueries } from '../../api/graphql/cooking/RecipeQueries';
import { MenuQueries } from '../../api/graphql/cooking/MenuQueries';
import { RecipeSearchType } from './RecipeSearchType';
import { RecipeGql } from '../../api/graphql/cooking/types/RecipeGql';
import { MenuGql } from '../../api/graphql/cooking/types/MenuGql';
import { RecipeIngredientGql } from '../../api/graphql/cooking/types/RecipeIngredientGql';

export class BotRecipe {
	static {
		// Allow self-signed certificates for development
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
	}

	static searchRecipes(search: RecipeSearchType[]) {
		return RecipeQueries.getRecipes(search);
	}

	static createReplyOptions(
		search: RecipeSearchType[],
		recipes: Array<RecipeGql>,
	) {
		const count = recipes.length;

		if (count === 1) {
			return {
				embeds: [BotRecipe.createReplySingleRecipe(recipes[0])],
			};
		}

		return BotRecipe.createReplyMultipleRecipes(search, recipes);
	}

	static async handleSelectRecipe(interaction: AnySelectMenuInteraction) {
		const recipeId = interaction.values[0];
		const search = [{ key: 'id', value: recipeId }];
		const recipes = await BotRecipe.searchRecipes(search);
		const replyOptions = BotRecipe.createReplyOptions(search, recipes);
		await interaction.reply(replyOptions);
	}

	private static createReplyMultipleRecipes(
		search: RecipeSearchType[],
		recipes: Array<RecipeGql>,
	) {
		const count = recipes.length;
		const headerBaseText = 'Résultats de la recherche ({count})';

		const worstCaseHeader = EmbedUtils.createHeader({
			text: headerBaseText.replace('{count}', `${count}/${count}`),
			ellipsis: true,
		});

		const footer = EmbedUtils.createFooter({
			text: `Recherche : ${search.map((s) => `${s.displayKey} : ${s.value}`).join(', ')}`,
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

		const sortedRecipes = [...recipes].sort((a, b) =>
			a.title.localeCompare(b.title),
		);

		for (const recipe of sortedRecipes) {
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

		const selectableRecipes = sortedRecipes.slice(
			0,
			BotConstants.COMPONENTS.LIMITS.SELECT_MENU_MAX_OPTIONS,
		);
		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId('recipe_select')
			.setPlaceholder('Sélectionnez une recette')
			.addOptions(
				selectableRecipes.map((recipe) => ({
					label: recipe.title,
					value: recipe.id,
				})),
			);

		const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
			selectMenu,
		);

		return { embeds: [embed], components: [row] };
	}

	private static sortByIndex(ingredients: Array<RecipeIngredientGql>) {
		ingredients.sort((a, b) => {
			if (a.index == null && b.index == null) return 0;
			if (a.index == null) return 1;
			if (b.index == null) return -1;
			return a.index - b.index;
		});
	}

	private static createReplySingleRecipe(recipe: RecipeGql) {
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

	public static async getWeeklyMenuMessage(nextWeek?: boolean) {
		const menu = await BotRecipe.getWeeklyMenu(nextWeek);
		if (!menu) {
			const embed = new EmbedBuilder()
				.setDescription(
					`Aucun menu trouvé pour ${nextWeek ? 'la semaine prochaine' : 'cette semaine'}.`,
				)
				.setColor(BotConstants.EMBEDS.COLORS.COOKING);
			return { embeds: [embed] };
		}
		return BotRecipe.buildWeeklyMenuMessage(menu);
	}

	private static buildWeeklyMenuMessage(menu: MenuGql) {
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

	private static splitEvently(items: Array<RecipeGql>, maxPerEmbed: number) {
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

	private static async getWeeklyMenu(nextWeek: boolean = false) {
		const menu = nextWeek
			? await BotRecipe.getNextWeekMenu()
			: await BotRecipe.getCurrentWeekMenu();
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
		const menus = await MenuQueries.getMenus({
			date: DateUtils.formatToIsoDateOnly(startDate),
		});
		return menus[0];
	}
}
