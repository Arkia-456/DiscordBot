import { GraphQLModel } from '../../GraphQLTypes';

export interface RecipeInstructionGql extends GraphQLModel {
	index: number;
	instruction: string;
}
