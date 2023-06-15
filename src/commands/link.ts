import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder } from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import { prisma, pusher } from '..';
import axios from 'axios';
import Colors from '../constants/Colors';

const dayjs = require('dayjs');

function addDashes(uuid: string): string {
	const segments = [
		uuid.substr(0, 8),
		uuid.substr(8, 4),
		uuid.substr(12, 4),
		uuid.substr(16, 4),
		uuid.substr(20)
	];

	return segments.join('-');
}

interface UUIDResponse {
	data: {
		id: string;
	};
}

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

		let uuidResp: UUIDResponse;

		try {
			uuidResp = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${username}`);
		} catch (err) {
			interaction.editReply({
				content: "You've provided an invalid username :c"
			});
			return;
		}

		const session = await prisma.sessions.create({
			data: {
				discordId: interaction.user.id,
				username,
				uuid: addDashes(uuidResp.data.id)
			}
		});

		pusher.trigger(server.apiKey, 'link-request', {
			username,
			discordName: interaction.user.username,
			sessionId: session.id
		});

		const embed = new EmbedBuilder().setColor(Colors.pink).setTitle('Check in game');
		embed.setDescription(`You should recieve a notification shortly!`);

		interaction.editReply({
			embeds: [embed]
		});
	}
}
