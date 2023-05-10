import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import { prisma, pusher } from '..';

const dayjs = require('dayjs');

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

		const previousSessions = await prisma.sessions.findMany({
			where: {
				discordId: interaction.user.id,
				status: 'denied',
				createdAt: {
					gte: dayjs().subtract(5, 'minute').toISOString()
				}
			}
		});

		if (previousSessions.length >= 1) {
			interaction.editReply({
				content: "You're currently blocked from sending requests to this account."
			});
			return;
		}

		const session = await prisma.sessions.create({
			data: {
				discordId: interaction.user.id,
				username
			}
		});

		pusher.trigger(server.apiKey, 'link-request', {
			username,
			discordName: interaction.user.username,
			sessionId: session.id
		});

		interaction.editReply({
			content: 'Check in game for a approval request.'
		});
	}
}
