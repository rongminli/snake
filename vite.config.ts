import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'path'

function _resolve(dir: string) {
  return path.resolve(__dirname, dir)
}
export default defineConfig({
  plugins: [
    vue(),
    vueJsx({
      // options are passed on to @vue/babel-plugin-jsx
    })],
  resolve: {
    alias: {
      '@': _resolve('src'),
    },
  },
})
