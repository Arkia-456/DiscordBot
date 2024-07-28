import { DataTypes, Model, NonAttribute, Sequelize } from 'sequelize';
import { YieldIngredient } from './YieldIngredient';

export class Yield extends Model {
	declare id: string;
	declare yields: number;
	declare recipeSlug: string;
	declare ingredients?: NonAttribute<YieldIngredient[]>;
}

const YieldAttributes = {
	id: {
		type: DataTypes.STRING,
		primaryKey: true,
	},
	yields: {
		type: DataTypes.INTEGER,
	},
	recipeSlug: {
		type: DataTypes.STRING,
	},
};

export function initModel(sequelize: Sequelize) {
	Yield.init(YieldAttributes, {
		sequelize,
		tableName: 'yield',
	});
}