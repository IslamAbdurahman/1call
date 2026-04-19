import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const reverbKey = import.meta.env.VITE_REVERB_APP_KEY;

if (!reverbKey) {
    console.error('Reverb App Key is missing. Check your .env file and rebuild the frontend.');
}

// VITE_REVERB_HOST "0.0.0.0" yoki bo'sh bo'lsa, brauzer o'zi turgan
// domenni avtomatik oladi (window.location.hostname).
const reverbHost = (() => {
    const h = import.meta.env.VITE_REVERB_HOST;
    if (!h || h === '0.0.0.0' || h === '127.0.0.1') {
        return window.location.hostname;
    }
    return h;
})();

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: reverbKey || 'missing-key',
    wsHost: reverbHost,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
});
