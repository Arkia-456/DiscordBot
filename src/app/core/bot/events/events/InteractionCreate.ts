import { Events, Interaction } from 'discord.js';
import { CommandManager } from '../../commands/CommandManager';
import { SelectMenuManager } from '../../interactions/selectMenu/SelectMenuManager';

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
