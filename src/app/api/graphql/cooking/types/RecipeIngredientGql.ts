import { GraphQLModel } from '../../GraphQLTypes';
import { IngredientGql } from './IngredientGql';

export interface RecipeIngredientGql extends GraphQLModel {
	quantity?: number;
	unit?: string;
	index?: number;
	ingredient: IngredientGql;
}
