import { GraphQLModel } from '../../api/graphql/GraphQLTypes';
import { IngredientGraphQLModel } from './IngredientGraphQLModel';

export class RecipeIngredientGraphQLModel extends GraphQLModel {
	declare quantity?: number;
	declare unit?: string;
	declare index?: number;
	declare ingredient: IngredientGraphQLModel;
}
