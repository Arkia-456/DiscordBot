export type GraphQLData = { [key: string]: any };
export interface GraphQLResponse<T extends GraphQLData> {
	data?: T;
	errors?: Array<{ message: string }>;
}
