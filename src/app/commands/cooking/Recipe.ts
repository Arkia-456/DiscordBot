import { Command } from '../../core/bot/interactions/commands/Command';
import { ICommand } from '../../core/bot/interactions/commands/ICommand';

export const commandInfo: ICommand = new Command(
	'Recipe',
	'recette',
	'Execute some recipe commands',
	undefined,
	{
		commandPath: __dirname,
		isPrivateGuildCommand: true,
		subcommandOnly: true,
	},
).commandInfo;
