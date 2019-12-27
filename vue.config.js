module.exports = {
	devServer: {
		proxy: {
			"/api": {
				target: "http://192.168.31.128:3000",
				// target: "http://localhost:3000",
				changeOrigin: true
			}
		}
	}
}