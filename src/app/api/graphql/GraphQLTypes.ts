export abstract class GraphQLModel {}

export type GraphQLData<T extends GraphQLModel> = {
	[key: string]: Array<T> | null;
};

export interface GraphQLResponse<T extends GraphQLModel> {
	data?: GraphQLData<T>;
	errors?: Array<{ message: string }> | null;
}
