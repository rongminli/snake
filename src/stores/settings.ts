import { defineStore } from 'pinia'

export const settingsStore = defineStore('settings', {
  state : () => {
    return {
      view: {
        showCoord: true
      },
      colors : {
        space: '#c8e6ca',
        snakeBody: '#008781',
        food: '#05a045',
        head: '#fb8c00',
        tail: '#fcc02e',
      }
    }
  }
})