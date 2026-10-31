import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import axiosClient from '~/plugins/axios'

// Conexión al WebSocket de Laravel Reverb (avisos en tiempo real de la campana del admin).
// Sin VITE_REVERB_APP_KEY no se conecta y la campana sigue con su consulta periódica.
const key = import.meta.env.VITE_REVERB_APP_KEY
const scheme = import.meta.env.VITE_REVERB_SCHEME ?? 'https'
const port = Number(import.meta.env.VITE_REVERB_PORT) || (scheme === 'https' ? 443 : 80)

let echo: Echo<'reverb'> | null = null

const connect = () => {
  echo ??= new Echo({
    broadcaster: 'reverb',
    Pusher,
    key,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: port,
    wssPort: port,
    forceTLS: scheme === 'https',
    enabledTransports: ['ws', 'wss'],
    // el canal privado se autoriza con la cookie de Sanctum, como el resto del API
    channelAuthorization: {
      endpoint: '',
      transport: 'ajax',
      customHandler: ({ socketId, channelName }, callback) => {
        axiosClient.post('/broadcasting/auth', { socket_id: socketId, channel_name: channelName })
          .then(({ data }) => callback(null, data))
          .catch(error => callback(error, null))
      },
    },
  })
  return echo
}

/**
 * Escucha los avisos del usuario en su canal privado.
 * `onReconnect` corre cada vez que el socket se reconecta, para recuperar lo que llegó mientras estuvo caído.
 * Devuelve la función que deja de escuchar.
 */
export function listenToNotifications<T>(userId: number, onNotification: (payload: T) => void, onReconnect: () => void) {
  if (!key) return () => {}

  const client = connect()
  const channelName = `App.Models.User.${userId}`
  client.private(channelName).notification(onNotification)

  const connection = client.connector.pusher.connection
  let wasConnected = connection.state === 'connected'
  const onState = ({ current }: { current: string }) => {
    if (current === 'connected' && wasConnected) onReconnect()
    if (current === 'connected') wasConnected = true
  }
  connection.bind('state_change', onState)

  return () => {
    connection.unbind('state_change', onState)
    client.leave(channelName)
  }
}
