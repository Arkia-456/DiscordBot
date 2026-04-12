import { AnySelectMenuInteraction } from 'discord.js';
import { BotRecipe } from '../../../../commands/cooking/BotRecipe';

export class SelectMenuManager {
	public static async handleInteraction(interaction: AnySelectMenuInteraction) {
		if (interaction.customId.startsWith('recipe_')) {
			await BotRecipe.handleSelectRecipe(interaction);
		}
	}
}
