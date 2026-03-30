module.exports = {
	globDirectory: 'dist',
	globPatterns: [
		'**/*.{json,png,html,ico,css,svg,jpeg,js}'
	],
	swDest: 'dist/sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};