import { DataTypes, Model, Sequelize } from 'sequelize';

export default class Ingredient extends Model {}

const IngredientAttributes = {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	slug: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
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