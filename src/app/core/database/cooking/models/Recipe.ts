import { BelongsToManyAddAssociationMixin, CreationOptional, DataTypes, FindOptions, InferAttributes, InferCreationAttributes, Model, Op, Sequelize } from 'sequelize';
import { Tag } from './Tag';
import { Yield } from './Yield';
import { Step } from './Step';

export class Recipe extends Model<InferAttributes<Recipe>, InferCreationAttributes<Recipe>> {
	declare id: CreationOptional<number>;
	declare slug: string;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	declare description: string|null;
	declare headline: string|null;
	declare name: string;
	declare preparationTime: number;
	declare totalTime: number;
	declare Yields?: Array<Yield>;
	declare Steps?: Array<Step>;

	declare addTag: BelongsToManyAddAssociationMixin<Tag, number>;

	static findRecipesWithTag(tag: string, idsToExclude?: Array<number>) {
		const findOptions: FindOptions = {
			include: [
				{
					model: Tag,
					where: {
						name: tag,
					},
				},
			],
		};
		if (idsToExclude) {
			findOptions.where = {
				id: {
					[Op.notIn]: idsToExclude,
				},
			};
		}
		return Recipe.findAll(findOptions);
	}
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
		unique: 'slug',
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