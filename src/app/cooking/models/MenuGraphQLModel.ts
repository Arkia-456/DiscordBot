import { GraphQLModel } from '../../api/graphql/GraphQLTypes';
import { RecipeGraphQLModel } from './RecipeGraphQLModel';

export class MenuGraphQLModel extends GraphQLModel {
	declare date: Date;
	declare recipes: Array<RecipeGraphQLModel>;
}
