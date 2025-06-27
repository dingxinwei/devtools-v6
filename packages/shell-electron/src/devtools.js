import io from 'socket.io-client'
import { initDevTools } from '@front'
import { Bridge } from '@vue-devtools/shared-utils'
const roomId = getRouterParam('roomId')
const origin = window.location.origin
const socket = io(origin + `?roomId=${roomId}`, { transports: ['websocket'], path: '/universal/vueDevtools/websocket/' })
const $ = document.querySelector.bind(document)
const $intro = $('#intro')

let reload = null
let introTimer
function getRouterParam (name) {
  const params = window.location.href.split('?')[1]
  if (!params) {
    return ''
  }
  let paramList = []
  let param = null
  const theRequest = {}
  if (params.length > 0) {
    if (params.indexOf('&') >= 0) {
      paramList = params.split('&')
    } else {
      paramList[0] = params
    }
    for (let i = 0; i < paramList.length; i++) {
      theRequest[paramList[i].split('=')[0]] = decodeURIComponent(
        paramList[i].split('=')[1]
      )
    }
    param = theRequest[name]
  }
  return param
}
socket.on('vue-devtools-disconnect-devtools', () => {
  introTimer = setTimeout(() => {
    $intro.classList.remove('hidden')
  }, 2000)
})

socket.on('vue-devtools-init', () => {
  clearTimeout(introTimer)
  $intro.classList.add('hidden')

  // Reset attached listeners
  socket.off('vue-message')

  // If new page is opened reload devtools
  if (reload) return reload()

  initDevTools({
    connect (callback) {
      const wall = {
        listen (fn) {
          socket.on('vue-message', data => fn(data))
        },
        send (data) {
          if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.log('%cdevtools -> backend', 'color:#888;', data)
          }
          socket.emit('vue-message', data)
        },
      }
      const bridge = new Bridge(wall)

      callback(bridge)
    },
    onReload (fn) {
      reload = fn
    },
  })
})
