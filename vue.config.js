module.exports = {
	devServer: {
		proxy: {
			"/api": {
				target: "http://192.168.31.151:3000",
				changeOrigin: true
			}
		}
	}
}