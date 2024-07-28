import { Database } from '../Database';
import Ingredient from './models/Ingredient';
import { Recipe } from './models/Recipe';
import { Step } from './models/Step';
import { Yield } from './models/Yield';
import { YieldIngredient } from './models/YieldIngredient';

export default class CookingDatabase extends Database {
	constructor() {
		super('cooking');
	}

	protected async initAssociations() {
		Recipe.hasMany(Yield, { foreignKey: 'recipeSlug' });
		Yield.belongsTo(Recipe, { foreignKey: 'recipeSlug' });

		Yield.hasMany(YieldIngredient, { foreignKey: 'yieldId' });
		YieldIngredient.belongsTo(Yield, { foreignKey: 'yieldId' });

		Ingredient.hasMany(YieldIngredient, { foreignKey: 'ingredientSlug' });
		YieldIngredient.belongsTo(Ingredient, { foreignKey: 'ingredientSlug' });

		Recipe.hasMany(Step, { foreignKey: 'recipeSlug' });
		Step.belongsTo(Recipe, { foreignKey: 'recipeSlug' });
	}
}