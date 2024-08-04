import { CreationOptional, DataTypes, Model, Sequelize } from 'sequelize';

export class Tag extends Model {
	declare id: CreationOptional<number>;
	declare name: string;
}

const TagAttributes = {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
};

export function initModel(sequelize: Sequelize) {
	Tag.init(TagAttributes, {
		sequelize,
		tableName: 'tag',
	});
}