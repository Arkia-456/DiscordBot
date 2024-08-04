import { DataTypes, Model, Sequelize } from 'sequelize';

export class Step extends Model {
	declare id: string;
	declare index: number;
	declare instructions: string;
	declare recipeSlug: string;
}

const StepAttributes = {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	index: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	instructions: {
		type: DataTypes.TEXT,
		allowNull: false,
	},
};

export function initModel(sequelize: Sequelize) {
	Step.init(StepAttributes, {
		sequelize,
		tableName: 'step',
	});
}