import io from 'socket.io-client'
import { initBackend } from '@back'
import { installToast } from '@back/toast'
import { Bridge, target } from '@vue-devtools/shared-utils'
import randomId from 'licia/randomId'
const roomId = randomId(6)
const host = target.__VUE_DEVTOOLS_HOST__
const port = target.__VUE_DEVTOOLS_PORT__
const fullHost = port ? host + ':' + port : host
const createSocket = target.__VUE_DEVTOOLS_SOCKET__ || io
document.addEventListener('DOMContentLoaded', () => {
  const key = window.document.querySelector('script[devtools]').getAttribute('devtools')
  const url = window.location.href
  const title = document.title
  const socket = createSocket(fullHost, { transports: ['websocket'], path: '/universal/vueDevtools/websocket/', query: { roomId, title, url, key } })
  const connectedMessage = () => {
    if (target.__VUE_DEVTOOLS_TOAST__) {
      target.__VUE_DEVTOOLS_TOAST__('Remote Devtools Connected', 'normal')
    }
  }

  const disconnectedMessage = () => {
    if (target.__VUE_DEVTOOLS_TOAST__) {
      target.__VUE_DEVTOOLS_TOAST__('Remote Devtools Disconnected', 'error')
    }
  }

  socket.on('connect', () => {
    connectedMessage()
    initBackend(bridge)
    socket.emit('vue-devtools-init')
  })

  // Global disconnect handler. Fires in two cases:
  // - after calling above socket.disconnect()
  // - once devtools is closed (that's why we need socket.disconnect() here too, to prevent further polling)
  socket.on('disconnect', () => {
    socket.disconnect()
    disconnectedMessage()
  })

  // Disconnect socket once other client is connected
  socket.on('vue-devtools-disconnect-backend', () => {
    socket.disconnect()
  })

  const bridge = new Bridge({
    listen (fn) {
      socket.on('vue-message', data => fn(data))
    },
    send (data) {
      socket.emit('vue-message', data)
    },
  })

  bridge.on('shutdown', () => {
    socket.disconnect()
    disconnectedMessage()
  })

  installToast(target)
  setTimeout(() => {
    try {
      /* eslint-disable-next-line */
      target.__VUE_DEVTOOLS_GLOBAL_HOOK__.emit('init', (target.document.querySelector('#app').__vue__.__proto__.constructor.config.devtools = true) && target.document.querySelector('#app').__vue__.__proto__.constructor)
    } catch (error) {
      /* eslint-disable-next-line */
      target.__VUE_DEVTOOLS_GLOBAL_HOOK__.emit('init', (target.document.querySelector('#app').__vue__.__proto__.__proto__.constructor.config.devtools = true) && target.document.querySelector('#app').__vue__.__proto__.__proto__.constructor)
    }
  })
})
