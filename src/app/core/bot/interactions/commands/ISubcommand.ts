import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';

export interface ISubcommand {
	slashCommandSubcommandBuilder: SlashCommandSubcommandBuilder;
	execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}