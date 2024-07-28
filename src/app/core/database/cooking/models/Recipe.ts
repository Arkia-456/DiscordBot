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
	slug: {
		type: DataTypes.STRING,
		primaryKey: true,
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