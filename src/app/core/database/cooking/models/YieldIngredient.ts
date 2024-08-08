import { CreationOptional, DataTypes, Model, NonAttribute, Sequelize } from 'sequelize';
import Ingredient from './Ingredient';

export class YieldIngredient extends Model {
	declare id: CreationOptional<number>;
	declare amount: number;
	declare unit: string;
	declare yieldId: number;
	declare ingredient?: NonAttribute<Ingredient>;
	declare Ingredient?: NonAttribute<Ingredient>;
}

const YieldIngredientAttributes = {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	amount: {
		type: DataTypes.DECIMAL(10, 2),
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