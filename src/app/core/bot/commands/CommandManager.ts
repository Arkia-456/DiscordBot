import { ApplicationCommand, ChatInputCommandInteraction, Client, REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from 'discord.js';
import { readdir } from 'fs/promises';
import { ICommand } from './ICommand';
import path from 'path';
import { ApplicationFatalError } from '../../utils/error/ApplicationFatalError';
import { Logger } from '../../utils/logger/Logger';

/**
 * Manage command registration and execution
 */
export class CommandManager {

	static commands = new Map<string, ICommand>();
	static applicationCommands = new Map<string, ApplicationCommand>();

	/**
	 * Register bot commands
	 * @param client
	 */
	public static async register(client: Client) {
		Logger.write('Registering commands...');
		const commandsToRegister = await CommandManager.getCommandsToRegister();
		await CommandManager.registerCommands(client, commandsToRegister);
		Logger.write('✔ Commands registered successfully');
	}

	/**
	 * Get commands to register from files
	 * @returns array of commands to register against Discord API
	 */
	private static async getCommandsToRegister() {
		const categoriesPath = path.join(__dirname, '..', '..', '..', 'commands');
		const categories: Array<string> = [];
		try {
			categories.push(...await readdir(categoriesPath));
		} catch (error) {
			throw new ApplicationFatalError({ message: 'Category getting failed', error: error });
		}
		const commandsToCheck: Array<Promise<Array<RESTPostAPIChatInputApplicationCommandsJSONBody>>> = [];
		categories.forEach(c => {
			if (c.endsWith('.js') || c.endsWith('.js.map')) return;
			const category = {
				name: c,
				path: path.join(categoriesPath, c),
			};
			commandsToCheck.push(CommandManager.getCommandsFromCategory(category));
		});

		return (await Promise.all(commandsToCheck)).flat();
	}

	/**
	 * Get commands from category folder
	 * @param category object representing a category, with a name and its path
	 * @returns array of category commands
	 */
	private static async getCommandsFromCategory(category: {name: string, path: string}) {
		const commandFiles: Array<string> = [];
		const commands: Array<RESTPostAPIChatInputApplicationCommandsJSONBody> = [];

		try {
			const files = await readdir(category.path);
			commandFiles.push(...files.filter(f => f.endsWith('.js')));
		} catch (error) {
			throw new ApplicationFatalError({ error: error });
		}

		let fileIndex = 0;
		Logger.write(`Importing commands: ${fileIndex}/${commandFiles.length}`);
		for (const file of commandFiles) {
			try {
				const commandInfoJson = await CommandManager.setCommandFromFile(path.join(category.path, file));
				if (commandInfoJson) commands.push(commandInfoJson);
			} finally {
				fileIndex++;
				Logger.write(`Importing commands: ${fileIndex}/${commandFiles.length}`, true);
			}
		}
		return commands;
	}

	/**
	 * Set CommandManager commands with command from file and return the command
	 * @param filePath
	 * @returns command in JSON format
	 */
	private static async setCommandFromFile(filePath: string) {
		const commandInfo = await CommandManager.getCommandFromFile(filePath);
		if (!commandInfo) return;
		CommandManager.commands.set(commandInfo.slashCommandBuilder.name, commandInfo);
		return commandInfo.slashCommandBuilder.toJSON();
	}

	/**
	 * Get command from file
	 * @param filePath
	 * @returns command
	 */
	private static async getCommandFromFile(filePath: string) {
		let commandInfo;
		try {
			commandInfo = (await import(filePath)).commandInfo as ICommand;
		} catch (error) {
			console.error(error);
		}
		if (!commandInfo?.slashCommandBuilder) {
			Logger.write(`Command ${filePath} is not a slash command`);
			return;
		}
		return commandInfo;
	}

	/**
	 * Register commands against Discord API
	 * @param client
	 * @param commands commands to register
	 */
	private static async registerCommands(client: Client, commands: Array<RESTPostAPIChatInputApplicationCommandsJSONBody>) {
		const botToken = process.env.BOT_TOKEN;
		if (!botToken) throw new ApplicationFatalError({ message: 'Missing bot token' });
		const clientId = process.env.BOT_ID;
		if (!clientId) throw new ApplicationFatalError({ message: 'Client application ID not found' });
		const rest = new REST().setToken(botToken);

		const applicationCommands = await rest.get(Routes.applicationCommands(clientId)) as Array<ApplicationCommand>;

		await Promise.all(CommandManager.deleteCommands(applicationCommands, commands, rest, clientId));

		try {
			const data = await rest.put(
				Routes.applicationCommands(clientId),
				{ body: commands },
			);
			Logger.write(`Successfully reloaded ${Array.isArray(data) ? data.length : '#ERROR:NotAnArray#'} application slash commands.`);
		} catch (error) {
			throw new ApplicationFatalError({ message: 'Impossible to register commands against API', error: error });
		}
	}

	/**
	 * Delete commands from API that not exist in CommandManager commands
	 * @param applicationCommands Application commands from Discord API
	 * @param commandsToRegister CommandManager's commands to register
	 * @param rest
	 * @param clientId
	 * @returns Array of promise of command deletion
	 */
	private static deleteCommands(applicationCommands: Array<ApplicationCommand>, commandsToRegister: Array<RESTPostAPIChatInputApplicationCommandsJSONBody>, rest: REST, clientId: string) {
		const toDelete = applicationCommands.filter(command => !commandsToRegister.find(c => c.name === command.name));
		return toDelete.map(command => rest.delete(Routes.applicationCommand(clientId, command.id)));
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