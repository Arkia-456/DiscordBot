import { DataTypes, Model, Sequelize } from 'sequelize';

export default class Ingredient extends Model {}

const IngredientAttributes = {
	slug: {
		type: DataTypes.STRING,
		primaryKey: true,
	},
	name: {
		type: DataTypes.STRING,
	},
};

export function initModel(sequelize: Sequelize) {
	Ingredient.init(IngredientAttributes, {
		sequelize,
		tableName: 'ingredient',
	});
}