import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js';
import { Discord, Guard, Slash, SlashGroup, SlashOption } from 'discordx';
import { RequirePermission } from '../guards/RequirePermission';
import { prisma } from '..';

@Discord()
@Guard(RequirePermission('ManageGuild'))
@SlashGroup({
	description: 'Manage Linky settings',
	name: 'settings'
})
@SlashGroup('settings')
class SettingsCommand {
	@Slash({ description: 'Set your servers API key' })
	async apikey(
		@SlashOption({
			description: 'Server API Key',
			name: 'key',
			required: true,
			type: ApplicationCommandOptionType.String
		})
		key: string,
		interaction: CommandInteraction
	) {
		await interaction.deferReply({
			ephemeral: true
		});

		await prisma.server.update({
			where: {
				id: interaction.guildId
			},
			data: {
				apiKey: key
			}
		});

		interaction.editReply({
			content: 'Successfully set the servers API key.'
		});
	}
}
