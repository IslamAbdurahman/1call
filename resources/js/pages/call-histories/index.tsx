import { Head, Link, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/layouts/app-layout';
import { useState, useRef } from 'react';
import {
    PhoneIncoming,
    PhoneOutgoing,
    PhoneMissed,
    Play,
    Pause,
    Square,
    Search,
    Filter,
    Clock,
    Calendar,
    Hash,
    Mic,
    MicOff,
} from 'lucide-react';

interface CallHistoryItem {
    id: number;
    date_time: string | null;
    src: string | null;
    dst: string | null;
    external_number: string | null;
    contact_name: string | null;
    duration: number;
    conversation: string | null;
    type: string | null;
    status: string | null;
    recorded_file: string | null;
    linked_id: string | null;
    event_count: number;
    module: string | null;
    auto_call_id: string | null;
    call_id: string | null;
}

interface PaginatedData {
    data: CallHistoryItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Filters {
    search?: string;
    status?: string;
    type?: string;
    date_from?: string;
    date_to?: string;
}

interface Props {
    histories: PaginatedData;
    filters: Filters;
}

function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function formatDateTime(dt: string | null): string {
    if (!dt) return '-';
    return new Date(dt).toLocaleString('uz-UZ', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

function TypeBadge({ type, t }: { type: string | null; t: (key: string) => string }) {
    if (!type) return <span className="text-gray-400 text-xs">—</span>;
    const map: Record<string, { labelKey: string; icon: React.ReactNode; cls: string }> = {
        inbound: { labelKey: 'callHistory.inbound', icon: <PhoneIncoming className="w-3 h-3" />, cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
        outbound: { labelKey: 'callHistory.outbound', icon: <PhoneOutgoing className="w-3 h-3" />, cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
        internal: { labelKey: 'callHistory.internal', icon: <PhoneIncoming className="w-3 h-3" />, cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
    };
    const badge = map[type.toLowerCase()] ?? { labelKey: '', icon: null, cls: 'bg-gray-100 text-gray-600' };
    const label = badge.labelKey ? t(badge.labelKey) : type;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.cls}`}>
            {badge.icon}{label}
        </span>
    );
}

function StatusBadge({ status, t }: { status: string | null; t: (key: string) => string }) {
    if (!status) return <span className="text-gray-400 text-xs">—</span>;
    const map: Record<string, { labelKey: string; cls: string }> = {
        answered: { labelKey: 'callHistory.answered', cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
        'no-answer': { labelKey: 'callHistory.noAnswer', cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' },
        busy: { labelKey: 'callHistory.busy', cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
        failed: { labelKey: 'callHistory.failed', cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
    };
    const badge = map[status.toLowerCase()] ?? { labelKey: '', cls: 'bg-gray-100 text-gray-600' };
    const label = badge.labelKey ? t(badge.labelKey) : status;
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badge.cls}`}>
            {label}
        </span>
    );
}

function AudioPlayer({ historyId, t }: { historyId: number; t: (key: string) => string }) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const src = `/call-histories/${historyId}/play`;

    const toggle = async () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (audio.paused) {
            setLoading(true);
            setError(null);
            try {
                await audio.play();
                setPlaying(true);
            } catch {
                setError(t('callHistory.fileError'));
            } finally {
                setLoading(false);
            }
        } else {
            audio.pause();
            setPlaying(false);
        }
    };

    const stop = () => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.pause();
        audio.currentTime = 0;
        setPlaying(false);
        setProgress(0);
    };

    const handleTimeUpdate = () => {
        const audio = audioRef.current;
        if (!audio || audio.duration === 0) return;
        setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) setDuration(audioRef.current.duration);
    };

    const seek = (e: React.MouseEvent<HTMLDivElement>) => {
        const audio = audioRef.current;
        if (!audio || !audio.duration) return;
        const bar = e.currentTarget;
        const rect = bar.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        audio.currentTime = ratio * audio.duration;
    };

    return (
        <div className="flex items-center gap-2 min-w-[220px]">
            <audio
                ref={audioRef}
                src={src}
                preload="none"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => { setPlaying(false); setProgress(0); }}
            />
            <button
                onClick={toggle}
                disabled={loading}
                className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white flex items-center justify-center transition-colors shadow"
                title={playing ? t('callHistory.pause') : t('callHistory.play')}
            >
                {loading ? (
                    <span className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                ) : playing ? (
                    <Pause className="w-3 h-3" />
                ) : (
                    <Play className="w-3 h-3 ml-0.5" />
                )}
            </button>

            <button
                onClick={stop}
                className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors"
                title={t('callHistory.stop')}
            >
                <Square className="w-3 h-3" />
            </button>

            <div className="flex-1 flex flex-col gap-0.5">
                <div
                    className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer overflow-hidden"
                    onClick={seek}
                >
                    <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-100"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                {error ? (
                    <span className="text-xs text-red-500">{error}</span>
                ) : (
                    <span className="text-[10px] text-gray-400">
                        {duration > 0 ? formatDuration(Math.floor(duration)) : ''}
                    </span>
                )}
            </div>
        </div>
    );
}

export default function CallHistoriesIndex({ histories, filters }: Props) {
    const { t } = useTranslation();
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [type, setType] = useState(filters.type ?? '');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');
    const [showFilters, setShowFilters] = useState(false);

    const applyFilters = () => {
        router.get('/call-histories', {
            search: search || undefined,
            status: status || undefined,
            type: type || undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
        }, { preserveState: true });
    };

    const resetFilters = () => {
        setSearch(''); setStatus(''); setType(''); setDateFrom(''); setDateTo('');
        router.get('/call-histories', {});
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') applyFilters();
    };

    return (
        <AppLayout breadcrumbs={[{ title: t('callHistory.title'), href: '/call-histories' }]}>
            <Head title={t('callHistory.title')} />

            <div className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('callHistory.title')}</h1>
                        <p className="text-sm text-gray-500 mt-0.5">{t('callHistory.total', { count: histories.total })}</p>
                    </div>
                    <button
                        onClick={() => setShowFilters(v => !v)}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <Filter className="w-4 h-4" />
                        {t('common.filter')}
                    </button>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={t('callHistory.searchPlaceholder')}
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <select
                                value={status}
                                onChange={e => setStatus(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="">{t('callHistory.allStatuses')}</option>
                                <option value="answered">{t('callHistory.answered')}</option>
                                <option value="no-answer">{t('callHistory.noAnswer')}</option>
                                <option value="busy">{t('callHistory.busy')}</option>
                                <option value="failed">{t('callHistory.failed')}</option>
                            </select>
                            <select
                                value={type}
                                onChange={e => setType(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="">{t('callHistory.allTypes')}</option>
                                <option value="inbound">{t('callHistory.inbound')}</option>
                                <option value="outbound">{t('callHistory.outbound')}</option>
                                <option value="internal">{t('callHistory.internal')}</option>
                            </select>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={e => setDateFrom(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            <input
                                type="date"
                                value={dateTo}
                                onChange={e => setDateTo(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={applyFilters}
                                className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
                            >
                                {t('callHistory.apply')}
                            </button>
                            <button
                                onClick={resetFilters}
                                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
                            >
                                {t('common.clear')}
                            </button>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700/60 border-b border-gray-200 dark:border-gray-600">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{t('common.id')}</span>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{t('callHistory.dateTime')}</span>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('callHistory.source')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('callHistory.destination')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('callHistory.externalNumber')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{t('callHistory.duration')}</span>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('callHistory.type')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('callHistory.status')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Call ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        <span className="flex items-center gap-1"><Mic className="w-3 h-3" />{t('callHistory.recording')}</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {histories.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="px-4 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                                <MicOff className="w-10 h-10 opacity-30" />
                                                <p className="text-sm">{t('callHistory.notFound')}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    histories.data.map((h) => (
                                        <tr
                                            key={h.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                                        >
                                            <td className="px-4 py-3 font-mono text-xs text-gray-500">{h.id}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-200 text-xs">{formatDateTime(h.date_time)}</td>
                                            <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-200">{h.src ?? '—'}</td>
                                            <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-200">{h.dst ?? '—'}</td>
                                            <td className="px-4 py-3 text-xs">
                                                {h.external_number ? (
                                                    <div>
                                                        {h.contact_name && (
                                                            <div className="font-semibold text-gray-900 dark:text-white">{h.contact_name}</div>
                                                        )}
                                                        <div className={`font-mono ${h.contact_name ? 'text-gray-400 dark:text-gray-500 text-[11px]' : 'text-gray-700 dark:text-gray-200'}`}>{h.external_number}</div>
                                                    </div>
                                                ) : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-200 font-mono">
                                                {formatDuration(h.duration)}
                                            </td>
                                            <td className="px-4 py-3"><TypeBadge type={h.type} t={t} /></td>
                                            <td className="px-4 py-3"><StatusBadge status={h.status} t={t} /></td>
                                            <td className="px-4 py-3 font-mono text-[10px] text-gray-400 max-w-[120px] truncate" title={h.call_id ?? ''}>
                                                {h.call_id ?? '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {h.recorded_file ? (
                                                    <AudioPlayer historyId={h.id} t={t} />
                                                ) : (
                                                    <span className="flex items-center gap-1 text-xs text-gray-400">
                                                        <MicOff className="w-3 h-3" />{t('callHistory.noRecording')}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {histories.last_page > 1 && (
                        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <span>
                                {histories.from ?? 0} – {histories.to ?? 0} / {histories.total}
                            </span>
                            <div className="flex flex-wrap gap-1">
                                {histories.links.map((link, i) => (
                                    link.url ? (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            className={`px-3 py-1 rounded-lg border text-xs transition-colors ${link.active
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span
                                            key={i}
                                            className="px-3 py-1 rounded-lg border text-xs border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    )
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
