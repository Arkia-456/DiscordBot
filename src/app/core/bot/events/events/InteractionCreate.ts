import { Events, Interaction } from 'discord.js';
import { CommandManager } from '../../commands/CommandManager';

async function execute(interaction: Interaction) {
	if (!interaction.isChatInputCommand()) return;
	CommandManager.handleCommand(interaction);
}

export default {
	name: Events.InteractionCreate,
	execute,
};