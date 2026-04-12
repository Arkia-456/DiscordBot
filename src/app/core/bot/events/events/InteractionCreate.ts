import { Events, Interaction } from 'discord.js';
import { SelectMenuManager } from '../../interactions/selectMenu/SelectMenuManager';
import { CommandManager } from '../../interactions/commands/CommandManager';

async function execute(interaction: Interaction) {
	console.log(interaction);
	if (interaction.isStringSelectMenu()) {
		SelectMenuManager.handleInteraction(interaction);
		return;
	}
	if (interaction.isChatInputCommand()) {
		CommandManager.handleCommand(interaction);
		return;
	}
}

export default {
	name: Events.InteractionCreate,
	execute,
};
