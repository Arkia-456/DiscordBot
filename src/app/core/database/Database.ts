import { Sequelize } from 'sequelize';
import DatabaseConfig from './DatabaseConfig';
import { readdir } from 'fs/promises';
import { ApplicationFatalError } from '../utils/error/ApplicationFatalError';
import { Logger } from '../utils/logger/Logger';

export abstract class Database {

	public sequelize: Sequelize | undefined;
	private readonly name: string;
	private connected = false;

	public constructor(name: string) {
		this.name = name;
	}

	/**
	 * Initialize database instance by connecting to database and initializing models.
	 */
	public async init() {
		Logger.write(`
			-------------------------
			| Initializing database |
			-------------------------
		`);
		await this.connectDatabase();
		await this.initModels();
	}

	protected async initAssociations() {
		return;
	}

	/**
	 * Connect to database with config parameters.
	 */
	private async connectDatabase() {
		Logger.write('Connecting database...');

		if (this.sequelize) return;
		const config = DatabaseConfig.config;

		const mandatoryParameters = ['host', 'port', 'name', 'user', 'password'];
		const missingParameter = mandatoryParameters.reduce((missing: Array<string>, param) => {
			if (!config[param]) missing.push(param);
			return missing;
		}, []);
		if (missingParameter.length) {
			throw new ApplicationFatalError({ message: `Missing parameters: ${missingParameter.join(', ')}` });
		}

		const parsedPort = parseInt(config.port, 10);
		if (isNaN(parsedPort)) {
			throw new ApplicationFatalError({ message: `Error parsing port value, ${config.port} is not a number` });
		}

		this.sequelize = new Sequelize(config.name, config.user, config.password, {
			dialect: 'mysql',
			host: config.host,
			port: parsedPort,
			logging: false,
		});

		await this.sequelize.authenticate();
		this.connected = true;

		Logger.write('✔ Database connected successfully', true);
	}

	/**
	 * Initialize models from files.
	 */
	private async initModels() {
		Logger.write('Initializing models...');

		if (!this.sequelize || !this.connected) return;

		const files = await readdir(`${__dirname}/${this.name}/models`);
		for (const file of files) {
			await this.initModelFromFile(file);
		}

		await this.initAssociations();
		await this.sequelize.sync({ alter: true });
		Logger.write('✔ Models initialized successfully');
	}

	/**
	 * Initialize a model.
	 * @param file model file name with extension
	 */
	private async initModelFromFile(file: string) {
		const [name, extension] = file.split('.');
		Logger.write(`Initializing model ${name}...`);

		if (extension.length !== 2) return;

		const model = await import(`./${this.name}/models/${name}`);
		if (model.initModel) {
			await model.initModel(this.sequelize);
			Logger.write(`✔ Model ${name} initialized successfully`, true);
		}
	}

}