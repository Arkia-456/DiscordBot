import { DataTypes, Model, NonAttribute, Sequelize } from 'sequelize';
import Ingredient from './Ingredient';

export class YieldIngredient extends Model {
	declare id: string;
	declare amount: number;
	declare unit: string;
	declare ingredient?: NonAttribute<Ingredient>;
}

const YieldIngredientAttributes = {
	id: {
		type: DataTypes.STRING,
		primaryKey: true,
	},
	amount: {
		type: DataTypes.DECIMAL,
	},
	unit: {
		type: DataTypes.STRING,
	},
};

export function initModel(sequelize: Sequelize) {
	YieldIngredient.init(YieldIngredientAttributes, {
		sequelize,
		tableName: 'yieldingredient',
	});
}