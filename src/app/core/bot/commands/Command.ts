import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { readdirSync } from 'fs';
import path from 'path';
import { ISubcommand } from './ISubcommand';
import { ICommandParam } from './ICommandParam';

export class Command {
	private functionality: string;
	private name: string;
	private description: string;
	private commandPath: string | undefined;
	private execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
	private subcommands: Map<string, ISubcommand> = new Map();
	private isPrivateGuildCommand: boolean | undefined;

	constructor(functionality: string, name: string, description: string, execute: (interaction: ChatInputCommandInteraction) => Promise<void>, option?: ICommandParam) {
		this.functionality = functionality;
		this.name = name;
		this.description = description;
		this.execute = execute;
		if (option?.commandPath) this.commandPath = option.commandPath;
		if (option?.isPrivateGuildCommand) this.isPrivateGuildCommand = option.isPrivateGuildCommand;
	}

	get commandInfo() {
		return {
			slashCommandBuilder: this.buildCommand(),
			execute: (interaction: ChatInputCommandInteraction) => this.executeCommand(interaction),
			isPrivateGuildCommand: this.isPrivateGuildCommand,
		};
	}

	private buildCommand() {
		const command = new SlashCommandBuilder()
			.setName(this.name)
			.setDescription(this.description);

		const subcommands = this.getSubcommands();

		for (const subcommand of subcommands) {
			const subcommandInfo = this.loadSubcommand(subcommand);
			if (subcommandInfo) command.addSubcommand(subcommandInfo.slashCommandSubcommandBuilder);
		}

		return command;
	}

	private async executeCommand(interaction: ChatInputCommandInteraction) {
		const subcommandName = interaction.options.getSubcommand(false);
		if (subcommandName) {
			const subcommand = this.subcommands.get(subcommandName);
			if (subcommand) {
				subcommand.execute(interaction);
			}
		} else {
			this.execute(interaction);
		}
	}

	private getSubcommands() {
		const subcommandsFiles: Array<string> = [];
		if (!this.commandPath) return subcommandsFiles;
		try {
			subcommandsFiles.push(...readdirSync(path.join(this.commandPath, 'subcommands')));
		} catch (error) {
			return subcommandsFiles;
		}
		return subcommandsFiles.filter(file => file.endsWith('.js') && file.startsWith(this.functionality[0].toUpperCase() + this.functionality.slice(1)));
	}

	private loadSubcommand(subcommand: string) {
		if (!this.commandPath) return;
		const subcommandPath = path.join(this.commandPath, 'subcommands', subcommand);
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const subcommandInfo = require(subcommandPath).subcommandInfo as ISubcommand;
		this.subcommands.set(subcommandInfo.slashCommandSubcommandBuilder.name, subcommandInfo);
		return subcommandInfo;
	}
}