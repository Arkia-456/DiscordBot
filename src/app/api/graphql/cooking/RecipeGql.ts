import { UUID } from 'crypto';
import { GraphQLModel } from '../GraphQLTypes';
import { RecipeInstructionGql } from './RecipeInstructionGql';
import { RecipeIngredientGql } from './RecipeIngredientGql';
import { TagGql } from './TagGql';

export interface RecipeGql extends GraphQLModel {
	id: UUID;
	title: string;
	createdAt?: Date;
	updatedAt?: Date;
	recipeInstructions: Array<RecipeInstructionGql>;
	recipeIngredients: Array<RecipeIngredientGql>;
	tags: Array<TagGql>;
}
