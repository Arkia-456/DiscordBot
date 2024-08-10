import { DataTypes, Model, Sequelize } from 'sequelize';

export class RecipeMenu extends Model {
	declare recipeId: number;
}

const RecipeMenuAttributes = {
	recipeId: {
		type: DataTypes.INTEGER,
		primaryKey: true,
	},
	menuId: {
		type: DataTypes.INTEGER,
		primaryKey: true,
	},
};

export function initModel(sequelize: Sequelize) {
	RecipeMenu.init(RecipeMenuAttributes, {
		sequelize,
		tableName: 'recipemenus',
	});
}