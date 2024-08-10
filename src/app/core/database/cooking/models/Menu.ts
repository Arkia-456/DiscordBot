import { DataTypes, Model, Sequelize } from 'sequelize';

export class Menu extends Model {}

const MenuAttributes = {
	startDate: {
		type: DataTypes.DATEONLY,
	},
	messageId: {
		type: DataTypes.STRING,
	},
};

export function initModel(sequelize: Sequelize) {
	Menu.init(MenuAttributes, {
		sequelize,
		tableName: 'menu',
	});
}