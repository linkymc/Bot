import { ArgsOf, Discord, On } from 'discordx';
import { prisma } from '..';

@Discord()
class GuildEvents {
	@On({ event: 'guildCreate' })
	async onGuildJoin([guild]: ArgsOf<'guildCreate'>) {
		const server = await prisma.server.findFirst({
			where: {
				id: guild.id
			}
		});

		if (!server) return;

		await prisma.server.update({
			where: {
				id: guild.id
			},
			data: {
				inGuild: true
			}
		});
	}

	@On({ event: 'guildDelete' })
	async onGuildLeave([guild]: ArgsOf<'guildDelete'>) {
		const server = await prisma.server.findFirst({
			where: {
				id: guild.id
			}
		});

		if (!server) return;

		await prisma.server.update({
			where: {
				id: guild.id
			},
			data: {
				inGuild: false
			}
		});
	}
}
