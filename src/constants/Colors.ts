// Needed since discord.js within Typescript only supports decimals, for some reason.

function parseColor(color: string) {
	let baseColor = color;
	baseColor = color.replace('#', '');
	return parseInt(baseColor, 16);
}

export default {
	blue: parseColor('#9fd7ee'),
	green: parseColor('#9beba7'),
	red: parseColor('#ff697b'),
	pink: parseColor('#ffd4e3'),
	parseColor
};
