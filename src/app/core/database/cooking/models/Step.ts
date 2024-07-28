import { DataTypes, Model, Sequelize } from 'sequelize';

export class Step extends Model {
	declare id: string;
	declare index: number;
	declare instructions: string;
	declare recipeSlug: string;
}

const StepAttributes = {
	id: {
		type: DataTypes.STRING,
		primaryKey: true,
	},
	index: {
		type: DataTypes.INTEGER,
	},
	instructions: {
		type: DataTypes.TEXT,
	},
	recipeSlug: {
		type: DataTypes.STRING,
	},
};

export function initModel(sequelize: Sequelize) {
	Step.init(StepAttributes, {
		sequelize,
		tableName: 'step',
	});
}