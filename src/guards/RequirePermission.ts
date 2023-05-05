import {
	CommandInteraction,
	EmbedBuilder,
	PermissionResolvable,
	PermissionsBitField,
	StringSelectMenuInteraction,
	inlineCode
} from 'discord.js';
import { GuardFunction } from 'discordx';
import Colors from '../constants/Colors';
import { prettify } from '../lib/General';

export function RequirePermission(permission: PermissionResolvable) {
	const guard: GuardFunction<StringSelectMenuInteraction | CommandInteraction> = async (
		interaction,
		// unused client instance
		_,
		next
	) => {
		const permissions = interaction.member.permissions as Readonly<PermissionsBitField>;

		const hasPermission = permissions.has(permission);

		if (hasPermission) return await next();

		const _perm = prettify(permission.toString());

		const noPerrmission = new EmbedBuilder().setColor(Colors.red).setTitle('No permission!');
		noPerrmission.setDescription(`This command requires the ${inlineCode(_perm)} permission`);
		interaction.reply({
			embeds: [noPerrmission],
			ephemeral: true
		});
	};

	return guard;
}
