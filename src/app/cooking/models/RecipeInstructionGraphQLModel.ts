import { GraphQLModel } from '../../api/graphql/GraphQLTypes';

export class RecipeInstructionGraphQLModel extends GraphQLModel {
	declare index: number;
	declare instruction: string;
}
