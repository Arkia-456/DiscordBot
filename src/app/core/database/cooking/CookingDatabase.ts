import { Database } from '../Database';
import Ingredient from './models/Ingredient';
import { Menu } from './models/Menu';
import { Recipe } from './models/Recipe';
import { RecipeMenu } from './models/RecipeMenu';
import { Step } from './models/Step';
import { Tag } from './models/Tag';
import { Yield } from './models/Yield';
import { YieldIngredient } from './models/YieldIngredient';

export default class CookingDatabase extends Database {
	constructor() {
		super('cooking');
	}

	protected async initAssociations() {
		Recipe.hasMany(Yield, { foreignKey: 'recipeId' });
		Yield.belongsTo(Recipe, { foreignKey: 'recipeId' });

		Yield.hasMany(YieldIngredient, { foreignKey: 'yieldId' });
		YieldIngredient.belongsTo(Yield, { foreignKey: 'yieldId' });

		Ingredient.hasMany(YieldIngredient, { foreignKey: 'ingredientId' });
		YieldIngredient.belongsTo(Ingredient, { foreignKey: 'ingredientId' });

		Recipe.hasMany(Step, { foreignKey: 'recipeId' });
		Step.belongsTo(Recipe, { foreignKey: 'recipeId' });

		Recipe.belongsToMany(Tag, { through: 'recipeTags', foreignKey: 'recipeId', otherKey: 'tagId' });
		Tag.belongsToMany(Recipe, { through: 'recipeTags', foreignKey: 'tagId', otherKey: 'recipeId' });

		Recipe.belongsToMany(Menu, { through: { model: RecipeMenu }, foreignKey: 'recipeId', otherKey: 'menuId' });
		Menu.belongsToMany(Recipe, { through: { model: RecipeMenu }, foreignKey: 'menuId', otherKey: 'recipeId' });
	}
}