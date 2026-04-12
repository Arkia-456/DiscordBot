import { Events, Interaction } from 'discord.js';
import { SelectMenuManager } from '../../interactions/selectMenu/SelectMenuManager';
import { CommandManager } from '../../interactions/commands/CommandManager';
import { ButtonManager } from '../../interactions/button/ButtonManager';

async function execute(interaction: Interaction) {
	if (interaction.isButton()) {
		ButtonManager.handleInteraction(interaction);
		return;
	}
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
