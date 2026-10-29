const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack')

// VUE_APP_HASH=1 genera una versión de un solo archivo (vista previa), sin chunks separados.
const unSoloArchivo = !!process.env.VUE_APP_HASH

module.exports = defineConfig({
  transpileDependencies: true,
  // Sin mapas de código fuente en producción: no se publica el código original legible.
  productionSourceMap: false,
  publicPath: unSoloArchivo ? './' : '/',
  pages: {
    index: {
      entry: 'src/main.js',
      title: 'mono.tecno — Hardware y servicio técnico'
    }
  },
  configureWebpack: unSoloArchivo
    ? {
        plugins: [new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 })],
        module: { parser: { javascript: {} } }
      }
    : {},
  chainWebpack: (config) => {
    if (unSoloArchivo) {
      config.optimization.splitChunks(false)
      config.module.rule('images').set('parser', { dataUrlCondition: { maxSize: 10 * 1024 * 1024 } })
    }
  }
})
