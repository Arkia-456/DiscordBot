import { ICommand } from '../../core/bot/commands/ICommand';
import { Command } from '../../core/bot/commands/Command';

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