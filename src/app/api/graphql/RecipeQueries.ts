import { RecipeGraphQLModel } from '../../cooking/models/RecipeGraphQLModel';
import { RecipeSearchType } from '../../cooking/types/RecipeSearchType';
import { BotConstants } from '../../core/bot/BotConstants';
import { ApplicationError } from '../../core/utils/error/ApplicationError';
import { GraphQLUtils } from '../../core/utils/GraphQLUtils';
import logger from '../../core/utils/logger/Logger';

export class RecipeQueries {
	static async getRecipes(searchOptions: RecipeSearchType[]) {
		const recipeSearchOptions = ['title'];
		const ingredientSearchOptions = ['ingredient'];

		const whereConditions = searchOptions
			.map(({ key, value }) => {
				if (recipeSearchOptions.includes(key)) {
					return `${key}: { contains: "${value}" }`;
				}
				if (ingredientSearchOptions.includes(key)) {
					return `recipeIngredients: { some: { ingredient: { name: { contains: "${value}" } } } }`;
				}
				return null;
			})
			.filter(Boolean)
			.join('\n');

		const query = `
			query Recipes {
				recipes(where: { ${whereConditions} }) {
					id
					title
					recipeIngredients {
						quantity
						unit
						index
						ingredient {
							name
						}
					}
					recipeInstructions {
						index
						instruction
					}
				}
			}
		`;

		logger.info('GraphQL request', { query });

		try {
			const data = await GraphQLUtils.executeQuery<RecipeGraphQLModel>(
				BotConstants.COOKING_API_URL,
				query,
			);
			return data?.recipes ?? [];
		} catch (error) {
			throw new ApplicationError('Failed to fetch recipes', error);
		}
	}
}
