import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import { prisma, pusher } from '..';

@Discord()
class LinkCommand {
	@Slash({ description: 'Link your Minecraft account' })
	async link(
		@SlashOption({
			description: "What's your Minecraft IGN?",
			name: 'ign',
			required: true,
			type: ApplicationCommandOptionType.String
		})
		username: string,
		interaction: CommandInteraction
	) {

        // Arozeeeee make these messages pretty, ty 💜

		await interaction.deferReply({
			ephemeral: true
		});

		const server = await prisma.server.findFirst({
			where: {
				id: interaction.guildId
			}
		});

		if (!server.apiKey) {
			interaction.editReply({
				content: `This server hasn't setup Linky properly. Contact a server admin`
			});
			return;
		}

		pusher.trigger(server.apiKey, 'link-request', {
			username,
			discordName: interaction.user.username
		});

		interaction.editReply({
			content: 'Check in game for a approval request.'
		});
	}
}
