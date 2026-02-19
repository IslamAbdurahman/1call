import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/layouts/app-layout';
import { FileText } from 'lucide-react';

export default function CallLogsIndex({ logs }: { logs: any }) {
    const { t } = useTranslation();

    return (
        <AppLayout breadcrumbs={[{ title: t('callLogs.title'), href: '/call-logs' }]}>
            <Head title={t('callLogs.title')} />
            <div className="p-4 space-y-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('callLogs.title')}</h1>
                    <p className="text-sm text-gray-500 mt-0.5">{t('callLogs.total', { count: logs.total })}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700/60 border-b border-gray-200 dark:border-gray-600">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('common.id')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('callLogs.date')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('callLogs.operator')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('callLogs.number')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('callLogs.contact')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('callLogs.duration')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('callLogs.status')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {logs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                                <FileText className="w-10 h-10 opacity-30" />
                                                <p className="text-sm">{t('callLogs.notFound')}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : logs.data.map((log: any) => (
                                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                                        <td className="px-4 py-3 text-xs text-gray-400 font-mono">{log.id}</td>
                                        <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-200">{log.start_time}</td>
                                        <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{log.operator?.name || '—'}</td>
                                        <td className="px-4 py-3 font-mono text-xs">{log.sip_number?.number || '—'}</td>
                                        <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{log.contact?.name || log.contact?.phone || '—'}</td>
                                        <td className="px-4 py-3 font-mono text-xs">{log.duration}s</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${log.status === 'answered'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                                                }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {logs.last_page > 1 && (
                        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <span>{logs.from ?? 0} – {logs.to ?? 0} / {logs.total}</span>
                            <div className="flex flex-wrap gap-1">
                                {logs.links.map((link: any, i: number) => (
                                    link.url ? (
                                        <Link key={i} href={link.url} className={`px-3 py-1 rounded-lg border text-xs transition-colors ${link.active ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                                    ) : (
                                        <span key={i} className="px-3 py-1 rounded-lg border text-xs border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed" dangerouslySetInnerHTML={{ __html: link.label }} />
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
