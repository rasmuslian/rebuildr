module.exports = {
	globDirectory: 'dist',
	globPatterns: [
		'**/*.{png,ico,css,svg,jpeg,js}'
	],
	swDest: 'dist/sw.js',
	skipWaiting: true,
	clientsClaim: true,
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};