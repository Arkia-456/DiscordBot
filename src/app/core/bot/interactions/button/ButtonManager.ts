import { ButtonInteraction } from 'discord.js';
import { BotRecipe } from '../../../../commands/cooking/BotRecipe';

export class ButtonManager {
	public static async handleInteraction(interaction: ButtonInteraction) {
		if (interaction.customId.startsWith('recipe_')) {
			await BotRecipe.handleButtonInteraction(interaction);
		}
	}
}
