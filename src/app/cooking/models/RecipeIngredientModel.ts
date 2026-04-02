import { IngredientModel } from './IngredientModel';

export class RecipeIngredientModel {
	declare quantity?: number;
	declare unit?: string;
	declare index?: number;
	declare ingredient: IngredientModel;
}
