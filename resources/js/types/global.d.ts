import type { Auth } from '@/types/auth';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}

declare global {
    interface Window {
        Echo: Echo;
        Pusher: typeof Pusher;
    }
}
