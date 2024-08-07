import { ApplicationCommandOptionType, ChatInputCommandInteraction, SlashCommandBooleanOption, SlashCommandStringOption, SlashCommandSubcommandBuilder } from 'discord.js';
import { ICommandParam } from './ICommandParam';
import { ICommandOption } from './ICommandOption';

export class Subcommand {
	private name: string;
	private description: string;
	private execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
	private options: Array<ICommandOption> | undefined;

	constructor(name: string, description: string, execute: (interaction: ChatInputCommandInteraction) => Promise<void>, option?: ICommandParam) {
		this.name = name;
		this.description = description;
		this.execute = execute;
		if (option?.options) this.options = option.options;
	}

	get subcommandInfo() {
		return {
			slashCommandSubcommandBuilder: this.buildSubcommand(),
			execute: this.execute,
		};
	}

	private buildSubcommand() {
		const subcommand = new SlashCommandSubcommandBuilder()
			.setName(this.name)
			.setDescription(this.description);
		if (this.options?.length) {
			this.options.forEach(option => {
				this.addOption(subcommand, option.type, option);
			});
		}
		return subcommand;
	}

	private addOption(subcommand: SlashCommandSubcommandBuilder, type: ApplicationCommandOptionType, data: ICommandOption) {
		switch (type) {
			case ApplicationCommandOptionType.Boolean: {
				const option = new SlashCommandBooleanOption().setName(data.name).setDescription(data.description);
				subcommand.addBooleanOption(option);
				break;
			}
			case ApplicationCommandOptionType.String: {
				const option = new SlashCommandStringOption().setName(data.name).setDescription(data.description);
				if (data.choices) option.addChoices(data.choices);
				if (data.minLength) option.setMinLength(data.minLength);
				subcommand.addStringOption(option);
				break;
			}
			default:
				break;
		}
	}
}