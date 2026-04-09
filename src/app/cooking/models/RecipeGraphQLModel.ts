import { UUID } from 'crypto';
import { GraphQLModel } from '../../api/graphql/GraphQLTypes';
import { RecipeInstructionGraphQLModel } from './RecipeInstructionGraphQLModel';
import { RecipeIngredientGraphQLModel } from './RecipeIngredientGraphQLModel';
import { TagGraphQLModel } from './TagGraphQLModel';

export class RecipeGraphQLModel extends GraphQLModel {
	declare id: UUID;
	declare title: string;
	declare createdAt?: Date;
	declare updatedAt?: Date;
	declare recipeInstructions: Array<RecipeInstructionGraphQLModel>;
	declare recipeIngredients: Array<RecipeIngredientGraphQLModel>;
	declare tags: Array<TagGraphQLModel>;
}
