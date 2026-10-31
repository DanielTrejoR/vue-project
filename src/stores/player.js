import { defineStore } from 'pinia'
import axiosClient from '~/plugins/axios'

// Reproductor del sitio (admin y blog). El <audio> vive aquí, fuera de los componentes:
// cambiar de página o de layout no corta la música. Al recargar se recuerda la canción y el
// minuto, pero no arranca solo (los navegadores no dejan reproducir sin un clic).
const STORAGE_KEY = 'player'
// cuánto tiempo de canción tiene que haber pasado para que "anterior" la reinicie en vez de cambiarla
const RESTART_AFTER = 3

const audio = typeof Audio === 'undefined' ? null : new Audio()
if (audio) audio.preload = 'metadata'

const readSaved = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    } catch {
        return {}
    }
}

/** @typedef {{ id: number, title: string, artist: string | null, duration: number | null, audio_url: string, cover_url: string | null }} Track */
/** @typedef {{ id: number, name: string, description: string | null, tracks: Track[] }} Playlist */

export const usePlayerStore = defineStore('player', {
    state: () => ({
        /** @type {Playlist[]} */
        playlists: [],
        loaded: false,
        /** @type {number | null} */
        playlistId: null,
        index: 0,
        playing: false,
        currentTime: 0,
        duration: 0,
        error: '',
    }),
    getters: {
        hasMusic: state => state.playlists.length > 0,
        playlist: state => state.playlists.find(p => p.id === state.playlistId) ?? null,
        /** @returns {Track[]} */
        queue() {
            return this.playlist?.tracks ?? []
        },
        /** @returns {Track | null} */
        track() {
            return this.queue[this.index] ?? null
        },
        progress: state => (state.duration ? Math.min(state.currentTime / state.duration, 1) : 0),
    },
    actions: {
        // una sola vez por visita: las playlists cambian poco
        async load() {
            if (this.loaded || !audio) return
            this.loaded = true
            try {
                const { data } = await axiosClient.get('/music')
                this.playlists = data
            } catch {
                this.loaded = false
                return
            }
            this.bindAudio()
            this.restore()
        },

        // después de editar la música en el admin: lo que suena sigue, solo cambia la lista
        async refresh() {
            if (!this.loaded) return
            const trackId = this.track?.id
            const { data } = await axiosClient.get('/music')
            this.playlists = data
            const index = this.queue.findIndex(t => t.id === trackId)
            if (index >= 0) {
                this.index = index
            } else if (!this.playing) {
                // la canción o su playlist ya no están (o se ocultaron)
                this.restore()
            }
        },

        /** @param {number} playlistId @param {number} [index] */
        select(playlistId, index = 0) {
            this.playlistId = playlistId
            this.index = index
            this.setSource()
            this.play()
        },

        play() {
            if (!audio || !this.track) return
            this.error = ''
            audio.play().catch(() => {
                // sin interacción previa o el archivo no carga
                this.playing = false
            })
        },
        pause() {
            audio?.pause()
        },
        toggle() {
            if (!this.track && this.playlists.length) return this.select(this.playlists[0].id)
            this.playing ? this.pause() : this.play()
        },
        next() {
            if (!this.queue.length) return
            this.index = (this.index + 1) % this.queue.length
            this.setSource()
            this.play()
        },
        prev() {
            if (!this.queue.length) return
            if (this.currentTime > RESTART_AFTER) return this.seek(0)
            this.index = (this.index - 1 + this.queue.length) % this.queue.length
            this.setSource()
            this.play()
        },
        /** @param {number} seconds */
        seek(seconds) {
            if (!audio) return
            audio.currentTime = seconds
            this.currentTime = seconds
        },

        // --- internos ---

        setSource(startAt = 0) {
            if (!audio || !this.track) return
            audio.src = this.track.audio_url
            this.currentTime = startAt
            this.duration = this.track.duration || 0
            if (startAt) audio.addEventListener('loadedmetadata', () => { audio.currentTime = startAt }, { once: true })
            this.updateMediaSession()
            this.save()
        },

        bindAudio() {
            if (!audio) return
            let lastSave = 0
            audio.addEventListener('timeupdate', () => {
                this.currentTime = audio.currentTime
                if (Date.now() - lastSave > 5000) {
                    lastSave = Date.now()
                    this.save()
                }
            })
            audio.addEventListener('loadedmetadata', () => { this.duration = audio.duration || this.duration })
            audio.addEventListener('play', () => { this.playing = true })
            audio.addEventListener('pause', () => {
                this.playing = false
                this.save()
            })
            audio.addEventListener('ended', () => this.next())
            audio.addEventListener('error', () => {
                this.playing = false
                this.error = 'No se pudo cargar la canción.'
            })
            // al recargar o cerrar la pestaña, el minuto exacto (no el de hace 5 s)
            window.addEventListener('pagehide', () => this.save())

            // teclas multimedia y controles del sistema
            const session = navigator.mediaSession
            if (session) {
                session.setActionHandler('play', () => this.play())
                session.setActionHandler('pause', () => this.pause())
                session.setActionHandler('previoustrack', () => this.prev())
                session.setActionHandler('nexttrack', () => this.next())
            }
        },

        // la última canción y el minuto, en pausa; si la playlist ya no está se empieza por la primera
        restore() {
            const saved = readSaved()
            const playlist = this.playlists.find(p => p.id === saved.playlistId) ?? this.playlists[0]
            if (!playlist) return
            const index = Math.max(0, playlist.tracks.findIndex(t => t.id === saved.trackId))
            this.playlistId = playlist.id
            this.index = index
            const sameTrack = playlist.tracks[index]?.id === saved.trackId
            this.setSource(sameTrack ? saved.time || 0 : 0)
        },

        save() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    playlistId: this.playlistId,
                    trackId: this.track?.id,
                    time: Math.floor(this.currentTime),
                }))
            } catch {
                // sin almacenamiento (modo privado): solo no se recuerda
            }
        },

        updateMediaSession() {
            const track = this.track
            if (!track || !navigator.mediaSession || typeof MediaMetadata === 'undefined') return
            navigator.mediaSession.metadata = new MediaMetadata({
                title: track.title,
                artist: track.artist ?? '',
                album: this.playlist?.name ?? '',
                artwork: track.cover_url ? [{ src: track.cover_url }] : [],
            })
        },
    },
})
