import { CreationOptional, DataTypes, Model, NonAttribute, Sequelize } from 'sequelize';
import { YieldIngredient } from './YieldIngredient';

export class Yield extends Model {
	declare id: CreationOptional<number>;
	declare yields: number;
	declare recipeId: string;
	declare ingredients?: NonAttribute<YieldIngredient[]>;
	declare YieldIngredients?: Array<YieldIngredient>;
}

const YieldAttributes = {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	yields: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
};

export function initModel(sequelize: Sequelize) {
	Yield.init(YieldAttributes, {
		sequelize,
		tableName: 'yield',
	});
}