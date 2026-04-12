import { MenuGql } from './types/MenuGql';
import { BotConstants } from '../../../core/bot/BotConstants';
import { ApplicationError } from '../../../core/utils/error/ApplicationError';
import { GraphQLUtils } from '../../../core/utils/GraphQLUtils';
import logger from '../../../core/utils/logger/Logger';

abstract class SearchOptions {
	[key: string]: string | number | boolean;
}

export class MenuQueries {
	static async getMenus(searchOptions: SearchOptions) {
		const whereConditions = Object.entries(searchOptions)
			.map(([key, value]) => `${key}: { eq: "${value}" }`)
			.join(', ');

		const query = `
				query Menus {
					menus(where: { ${whereConditions} }) {
						date
						recipes {
							title
						}
					}
				}
			`;

		logger.info('GraphQL request', { query });

		try {
			const data = await GraphQLUtils.executeQuery<MenuGql>(
				BotConstants.COOKING_API_URL,
				query,
			);
			return data?.menus ?? [];
		} catch (error) {
			throw new ApplicationError('Failed to fetch menus', error);
		}
	}
}
