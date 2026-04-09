import { GraphQLModel, GraphQLResponse } from '../../api/graphql/GraphQLTypes';
import { ApplicationError } from './error/ApplicationError';

export class GraphQLUtils {
	public static async executeQuery<T extends GraphQLModel>(
		url: string,
		query: string,
	) {
		const resp = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query }),
		});
		const data: GraphQLResponse<T> = await resp.json();
		if (data.errors) {
			throw new ApplicationError('GraphQL query failed', data.errors);
		}
		return data.data;
	}
}
