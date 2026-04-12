import { RecipeGraphQLModel } from '../../cooking/models/RecipeGraphQLModel';
import { BotConstants } from '../../core/bot/BotConstants';
import { ApplicationError } from '../../core/utils/error/ApplicationError';
import { GraphQLUtils } from '../../core/utils/GraphQLUtils';
import logger from '../../core/utils/logger/Logger';

abstract class SearchOptions {
	[key: string]: string | number | boolean;
}

export class RecipeQueries {
	static async getRecipes(searchOptions: SearchOptions) {
		const whereConditions = Object.entries(searchOptions)
			.map(([key, value]) => `${key}: { contains: "${value}" }`)
			.join(', ');

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
