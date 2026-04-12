import {
	ApplicationCommandOptionChoiceData,
	ApplicationCommandOptionType,
} from 'discord.js';

export interface ICommandOption {
	type: ApplicationCommandOptionType;
	name: string;
	description: string;
	choices?: Array<ApplicationCommandOptionChoiceData<string>>;
	minLength?: number;
	required?: boolean;
}
