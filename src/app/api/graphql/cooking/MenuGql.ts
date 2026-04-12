import { GraphQLModel } from '../GraphQLTypes';
import { RecipeGql } from './RecipeGql';

export interface MenuGql extends GraphQLModel {
	date: Date;
	recipes: Array<RecipeGql>;
}
