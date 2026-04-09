import { UUID } from 'crypto';
import { RecipeInstructionModel } from './RecipeInstructionModel';
import { RecipeIngredientModel } from './RecipeIngredientModel';
import { TagModel } from './TagModel';

export class RecipeModel {
	declare id: UUID;
	declare title: string;
	declare createdAt?: Date;
	declare updatedAt?: Date;
	declare recipeInstructions: Array<RecipeInstructionModel>;
	declare recipeIngredients: Array<RecipeIngredientModel>;
	declare tags: Array<TagModel>;
}
