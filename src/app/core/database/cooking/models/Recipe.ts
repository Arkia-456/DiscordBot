import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';

export class Recipe extends Model<InferAttributes<Recipe>, InferCreationAttributes<Recipe>> {
	declare slug: string;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	declare description: string|null;
	declare headline: string|null;
	declare name: string;
	declare preparationTime: number;
	declare totalTime: number;
}

const RecipeAttributes = {
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
	createdAt: {
		type: DataTypes.DATE,
	},
	updatedAt: {
		type: DataTypes.DATE,
	},
	description: {
		type: DataTypes.TEXT,
	},
	headline: {
		type: DataTypes.STRING,
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	preparationTime: {
		type: DataTypes.INTEGER,
	},
	totalTime: {
		type: DataTypes.INTEGER,
	},
};

export function initModel(sequelize: Sequelize) {
	Recipe.init(RecipeAttributes, {
		sequelize,
		tableName: 'recipe',
	});
}