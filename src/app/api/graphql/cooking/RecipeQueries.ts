import { RecipeGql } from './types/RecipeGql';
import { RecipeSearchType } from '../../../commands/cooking/RecipeSearchType';
import { BotConstants } from '../../../core/bot/BotConstants';
import { ApplicationError } from '../../../core/utils/error/ApplicationError';
import { GraphQLUtils } from '../../../core/utils/GraphQLUtils';
import logger from '../../../core/utils/logger/Logger';

export class RecipeQueries {
	static async getRecipes(searchOptions: RecipeSearchType[]) {
		const searchConfig: Record<string, (value: string) => string> = {
			id: (value) => `id: { eq: "${value}" }`,
			title: (value) => `title: { contains: "${value}" }`,
			ingredient: (value) =>
				`recipeIngredients: { some: { ingredient: { name: { contains: "${value}" } } } }`,
		};

		const whereConditions = searchOptions
			.map(({ key, value }) => searchConfig[key]?.(value) ?? null)
			.filter(Boolean)
			.join('\n');

		const query = `
			query Recipes {
				recipes(where: { ${whereConditions} }) {
					id
					title
					subtitle
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
			const data = await GraphQLUtils.executeQuery<RecipeGql>(
				BotConstants.COOKING_API_URL,
				query,
			);
			return data?.recipes ?? [];
		} catch (error) {
			throw new ApplicationError('Failed to fetch recipes', error);
		}
	}
}
