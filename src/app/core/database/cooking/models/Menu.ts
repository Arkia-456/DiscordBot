import { BelongsToManyAddAssociationsMixin, CreationOptional, DataTypes, Model, Op, Sequelize } from 'sequelize';
import { Recipe } from './Recipe';
import { Tag } from './Tag';
import { MathUtils } from '../../../utils/MathUtils';
import { DateUtils } from '../../../utils/DateUtils';

export class Menu extends Model {
	declare id: CreationOptional<number>;
	declare messageId: CreationOptional<string>;
	declare startDate: Date;
	declare Recipes: Array<Recipe>;

	declare addRecipes: BelongsToManyAddAssociationsMixin<Recipe, number>;

	/**
	 * Create the menu of the week
	 * @returns week menu
	 */
	static async createWeekMenu() {
		const now = new Date();

		// Get recipes that have been in menus in the last 30 days to exclude them from selection
		const menus = await Menu.findAll({
			where: {
				startDate: {
					[Op.gte]: new Date(new Date().setDate(now.getDate() - 30)),
				},
			},
			include: [
				Recipe,
			],
		});
		const idsToExclude = menus.map(menu => menu.Recipes.map(recipe => recipe.id)).flat();

		// Get recipes with tag
		const taggedRecipes = (await Promise.all([
			Recipe.findRecipesWithTag('Worldwide', idsToExclude),
			Recipe.findRecipesWithTag('Végétarien', idsToExclude),
			Recipe.findRecipesWithTag('Rapide', idsToExclude),
		]));

		// Get 5 random recipes from each tag
		const randomTaggedRecipes: Array<Recipe> = taggedRecipes.map(recipePool => MathUtils.getRandomIndex(recipePool, 5)).flat();

		// Remove duplicates
		const randomUniqueTaggedRecipes = randomTaggedRecipes.filter((recipe, index, self) => self.findIndex(r => r?.id === recipe?.id) === index);

		// Get additional recipes to have 24 recipes in menu
		const additionalRecipes = await Recipe.findAll({
			include: [Tag],
			where: {
				id: {
					[Op.notIn]: [...randomUniqueTaggedRecipes.map(recipe => recipe.id), ...idsToExclude],
				},
			},
		});
		const randomAdditionalRecipes = MathUtils.getRandomIndex(additionalRecipes, 24 - randomUniqueTaggedRecipes.length);
		const list = [...randomUniqueTaggedRecipes, ...randomAdditionalRecipes];

		// Create menu
		const nextMonday = DateUtils.getNextNamedDay('monday');
		const menu = await Menu.create({
			startDate: nextMonday,
		});
		await menu.addRecipes(list);

		return menu;
	}

	/**
	 * Get the menu of the incoming week
	 * @param startDate start date from which to calculate next week
	 * @returns menu of the next week
	 */
	static async getNextWeekMenu(startDate?: Date) {
		const date = startDate ? new Date(startDate) : new Date();
		return Menu.getWeekMenu(date, true);
	}

	/**
	 * Get the menu of the current week
	 * @param startDate start date from which to calculate current week
	 * @returns menu of the current week
	 */
	static getCurrentWeekMenu(startDate?: Date) {
		const date = startDate ? new Date(startDate) : new Date();
		return Menu.getWeekMenu(date);
	}

	/**
	 * Get the menu of the start date's current or next week
	 * @param startDate start date from which to calculate current or next week
	 * @param nextWeek `true` to get start date's next week, `false` otherwise
	 * @returns menu of the week
	 */
	private static getWeekMenu(startDate: Date, nextWeek: boolean = false) {
		const date = new Date(startDate);
		const menuStartDate = nextWeek ? DateUtils.getNextNamedDay('monday', date) : DateUtils.getPreviousNamedDay('monday', date);
		return Menu.findOne({
			where: {
				startDate: menuStartDate,
			},
			include: [
				{
					model: Recipe,
					include: [Tag],
				},
			],
		});
	}

}

const MenuAttributes = {
	startDate: {
		type: DataTypes.DATEONLY,
	},
	messageId: {
		type: DataTypes.STRING,
	},
};

export function initModel(sequelize: Sequelize) {
	Menu.init(MenuAttributes, {
		sequelize,
		tableName: 'menu',
	});
}