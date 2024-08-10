import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, InteractionReplyOptions } from 'discord.js';
import { ISubcommand } from '../../../core/bot/commands/ISubcommand';
import { Subcommand } from '../../../core/bot/commands/Subcommand';
import { Bot } from '../../../core/bot/Bot';
import { BotConstants } from '../../../core/bot/BotConstants';

async function execute(interaction: ChatInputCommandInteraction) {
	const channel = interaction.channel;
	const currentMenuOption = interaction.options.getBoolean('current-week');
	if (channel) {
		let messageOptions: InteractionReplyOptions|string|undefined = await Bot.getWeeklyMenuMessage(channel, currentMenuOption ?? false);
		if (!messageOptions) {
			const embed = new EmbedBuilder()
				.setColor(BotConstants.EMBEDS.COLORS.COOKING)
				.setDescription(`Aucun menu trouvé pour ${currentMenuOption ? 'cette semaine' : 'la semaine prochaine'}.`);
			messageOptions = {
				embeds: [embed],
			};
		}
		await interaction.reply(messageOptions);
	}
}

export const subcommandInfo: ISubcommand = new Subcommand(
	'menu',
	'Affiche le menu de la semaine',
	execute,
	{
		options: [
			{
				type: ApplicationCommandOptionType.Boolean,
				name: 'current-week',
				description: 'Menu de la semaine en cours ? Si non, affiche le menu de la semaine prochaine',
			},
		],
	},
).subcommandInfo;