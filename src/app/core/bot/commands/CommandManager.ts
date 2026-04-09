import {
	ApplicationCommand,
	ChatInputCommandInteraction,
	REST,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	Routes,
} from 'discord.js';
import { readdir } from 'fs/promises';
import { ICommand } from './ICommand';
import path from 'path';
import { ApplicationFatalError } from '../../utils/error/ApplicationFatalError';
import logger from '../../utils/logger/Logger';

/**
 * Manage command registration and execution
 */
export class CommandManager {
	static commands = new Map<string, ICommand>();
	static applicationCommands = new Map<string, ApplicationCommand>();

	/**
	 * Register bot commands
	 */
	public static async register() {
		logger.info('Registering commands...');
		const [guildCommandsToRegister, globalCommandsToRegister] =
			await CommandManager.getCommandsToRegister();
		await CommandManager.registerCommands(
			guildCommandsToRegister,
			globalCommandsToRegister,
		);
		logger.info('✔ Commands registered successfully');
	}

	/**
	 * Get commands to register from files
	 * @returns array of commands to register against Discord API
	 */
	private static async getCommandsToRegister() {
		const categoriesPath = path.join(__dirname, '..', '..', '..', 'commands');
		const categories: Array<string> = [];
		try {
			categories.push(...(await readdir(categoriesPath)));
		} catch (error) {
			throw new ApplicationFatalError({
				message: 'Category getting failed',
				error: error,
			});
		}
		const commandsToCheck: Array<Promise<void>> = [];
		const guildCommandsToRegister: Array<RESTPostAPIChatInputApplicationCommandsJSONBody> =
			[];
		const globalCommandsToRegister: Array<RESTPostAPIChatInputApplicationCommandsJSONBody> =
			[];
		for (const category of categories) {
			if (category.endsWith('.js') || category.endsWith('.js.map')) continue;
			const c = {
				name: category,
				path: path.join(categoriesPath, category),
			};
			commandsToCheck.push(
				CommandManager.getCommandsFromCategory(
					c,
					guildCommandsToRegister,
					globalCommandsToRegister,
				),
			);
		}

		await Promise.all(commandsToCheck);
		return [guildCommandsToRegister, globalCommandsToRegister];
	}

	/**
	 * Get commands from category folder
	 * @param category object representing a category, with a name and its path
	 * @returns array of category commands
	 */
	private static async getCommandsFromCategory(
		category: { name: string; path: string },
		guildCommandsToRegister: Array<RESTPostAPIChatInputApplicationCommandsJSONBody>,
		globalCommandsToRegister: Array<RESTPostAPIChatInputApplicationCommandsJSONBody>,
	) {
		const commandFiles: Array<string> = [];
		const promises: Array<Promise<void>> = [];

		try {
			const files = await readdir(category.path);
			commandFiles.push(...files.filter((f) => f.endsWith('.js')));
		} catch (error) {
			throw new ApplicationFatalError({ error: error });
		}

		let fileIndex = 0;
		logger.info(`Importing commands: ${fileIndex}/${commandFiles.length}`);
		for (const file of commandFiles) {
			try {
				promises.push(
					CommandManager.setCommandFromFile(
						path.join(category.path, file),
						guildCommandsToRegister,
						globalCommandsToRegister,
					),
				);
			} finally {
				fileIndex++;
				logger.info(`Importing commands: ${fileIndex}/${commandFiles.length}`);
			}
		}
		await Promise.all(promises);
	}

	/**
	 * Set CommandManager commands with command from file and return the command
	 * @param filePath
	 * @returns command in JSON format
	 */
	private static async setCommandFromFile(
		filePath: string,
		guildCommandsToRegister: Array<RESTPostAPIChatInputApplicationCommandsJSONBody>,
		globalCommandsToRegister: Array<RESTPostAPIChatInputApplicationCommandsJSONBody>,
	) {
		const commandInfo = await CommandManager.getCommandFromFile(filePath);
		if (!commandInfo) return;
		CommandManager.commands.set(
			commandInfo.slashCommandBuilder.name,
			commandInfo,
		);
		if (commandInfo.isPrivateGuildCommand) {
			guildCommandsToRegister.push(commandInfo.slashCommandBuilder.toJSON());
		} else {
			globalCommandsToRegister.push(commandInfo.slashCommandBuilder.toJSON());
		}
	}

	/**
	 * Get command from file
	 * @param filePath
	 * @returns command
	 */
	private static async getCommandFromFile(filePath: string) {
		const commandInfo = (await import(filePath)).commandInfo as ICommand;
		if (!commandInfo?.slashCommandBuilder) {
			logger.info(`Command ${filePath} is not a slash command`);
			return;
		}
		return commandInfo;
	}

	/**
	 * Register commands against Discord API
	 * @param client
	 * @param commands commands to register
	 */
	private static async registerCommands(
		guildCommandsToRegister: Array<RESTPostAPIChatInputApplicationCommandsJSONBody>,
		globalCommandsToRegister: Array<RESTPostAPIChatInputApplicationCommandsJSONBody>,
	) {
		const botToken = process.env.BOT_TOKEN;
		if (!botToken) {
			throw new ApplicationFatalError({ message: 'Missing bot token' });
		}
		const clientId = process.env.BOT_ID;
		if (!clientId) {
			throw new ApplicationFatalError({
				message: 'Client application ID not found',
			});
		}
		const rest = new REST().setToken(botToken);

		try {
			let count = 0;
			const registeredGlobalCommands =
				await CommandManager.registerGlobalCommands(
					rest,
					clientId,
					globalCommandsToRegister,
				);
			const registeredGuildCommands =
				await CommandManager.registerGuildsCommands(
					rest,
					clientId,
					guildCommandsToRegister,
				);

			if (Array.isArray(registeredGlobalCommands)) {
				count += registeredGlobalCommands.length;
			}
			if (Array.isArray(registeredGuildCommands)) {
				count += registeredGuildCommands.length;
			}
			logger.info(`Successfully reloaded ${count} application slash commands.`);
		} catch (error) {
			throw new ApplicationFatalError({
				message: 'Impossible to register commands against API',
				error: error,
			});
		}
	}

	/**
	 * Register global commands
	 * @param rest
	 * @param clientId
	 * @param globalCommandsToRegister
	 * @returns array of registered global commands
	 */
	private static async registerGlobalCommands(
		rest: REST,
		clientId: string,
		globalCommandsToRegister: Array<RESTPostAPIChatInputApplicationCommandsJSONBody>,
	) {
		const applicationCommands = (await rest.get(
			Routes.applicationCommands(clientId),
		)) as Array<ApplicationCommand>;
		await Promise.all(
			CommandManager.deleteCommands(
				applicationCommands,
				globalCommandsToRegister,
				rest,
				clientId,
			),
		);
		return rest.put(Routes.applicationCommands(clientId), {
			body: globalCommandsToRegister,
		});
	}

	/**
	 * Register guilds commands
	 * @param rest
	 * @param clientId
	 * @param guildCommandsToRegister
	 * @returns array of registered guild commands
	 */
	private static async registerGuildsCommands(
		rest: REST,
		clientId: string,
		guildCommandsToRegister: Array<RESTPostAPIChatInputApplicationCommandsJSONBody>,
	) {
		const privateGuildIds = process.env.PRIVATE_GUILD_IDS?.split(',');
		const promises: Array<Promise<unknown>> = [];
		if (privateGuildIds) {
			privateGuildIds.forEach((guildId) =>
				promises.push(
					CommandManager.registerGuildCommands(
						rest,
						clientId,
						guildId,
						guildCommandsToRegister,
					),
				),
			);
		}
		return (await Promise.all(promises)).flat();
	}

	/**
	 * Register commands in one guild
	 * @param rest
	 * @param clientId
	 * @param guildId
	 * @param guildCommandsToRegister
	 * @returns array of registered guild commands
	 */
	private static async registerGuildCommands(
		rest: REST,
		clientId: string,
		guildId: string,
		guildCommandsToRegister: Array<RESTPostAPIChatInputApplicationCommandsJSONBody>,
	) {
		const applicationCommands = (await rest.get(
			Routes.applicationGuildCommands(clientId, guildId),
		)) as Array<ApplicationCommand>;
		await Promise.all(
			applicationCommands.map((command) =>
				rest.delete(
					Routes.applicationGuildCommand(clientId, guildId, command.id),
				),
			),
		);
		return rest.put(Routes.applicationGuildCommands(clientId, guildId), {
			body: guildCommandsToRegister,
		});
	}

	/**
	 * Delete commands from API that not exist in CommandManager commands
	 * @param applicationCommands Application commands from Discord API
	 * @param commandsToRegister CommandManager's commands to register
	 * @param rest
	 * @param clientId
	 * @returns Array of promise of command deletion
	 */
	private static deleteCommands(
		applicationCommands: Array<ApplicationCommand>,
		commandsToRegister: Array<RESTPostAPIChatInputApplicationCommandsJSONBody>,
		rest: REST,
		clientId: string,
	) {
		const toDelete = applicationCommands.filter(
			(command) => !commandsToRegister.find((c) => c.name === command.name),
		);
		return toDelete.map((command) =>
			rest.delete(Routes.applicationCommand(clientId, command.id)),
		);
	}

	/**
	 * Handle interaction command
	 * @param interaction
	 */
	public static async handleCommand(interaction: ChatInputCommandInteraction) {
		const commandInfo = CommandManager.commands.get(interaction.commandName);
		if (!commandInfo) return;

		try {
			await commandInfo.execute(interaction);
		} catch (error) {
			console.log(error);
		}
	}
}
