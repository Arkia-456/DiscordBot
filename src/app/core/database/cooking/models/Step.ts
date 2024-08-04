import { CreationOptional, DataTypes, Model, Sequelize } from 'sequelize';

export class Step extends Model {
	declare id: CreationOptional<number>;
	declare index: number;
	declare instructions: string;
	declare recipeId: number;
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