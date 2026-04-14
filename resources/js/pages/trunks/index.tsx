import { Head, useForm, router } from '@inertiajs/react';
import { Pencil, Trash2, Plus, Search, Globe, X, CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/layouts/app-layout';

interface Trunk {
    id: number;
    name: string;
    host: string;
    port: number;
    username?: string;
    password?: string;
    did?: string;
    transport: string;
    context: string;
    is_active: boolean;
}

export default function TrunksIndex({ trunks }: { trunks: Trunk[] }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        host: '',
        port: 5060,
        username: '',
        password: '',
        did: '',
        transport: 'transport-udp',
        context: 'from-external',
        is_active: true
    });

    const [editingTrunk, setEditingTrunk] = useState<Trunk | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filtered = trunks.filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.did?.includes(search));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingTrunk) {
            router.put(`/trunks/${editingTrunk.id}`, { ...data }, {
                onSuccess: () => { setIsOpen(false); reset(); setEditingTrunk(null); }
            });
        } else {
            post('/trunks', { onSuccess: () => { setIsOpen(false); reset(); } });
        }
    };

    const openEdit = (trunk: Trunk) => {
        setEditingTrunk(trunk);
        setData({
            name: trunk.name,
            host: trunk.host,
            port: trunk.port,
            username: trunk.username || '',
            password: trunk.password || '',
            did: trunk.did || '',
            transport: trunk.transport,
            context: trunk.context,
            is_active: trunk.is_active
        });
        setIsOpen(true);
    };

    const openCreate = () => {
        setEditingTrunk(null);
        reset();
        setIsOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm(t('trunks.deleteConfirm'))) {
            router.delete(`/trunks/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: t('trunks.title'), href: '/trunks' }]}>
            <Head title={t('trunks.title')} />
            <div className="p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('trunks.title')}</h1>
                        <p className="text-sm text-gray-500 mt-0.5">{t('trunks.total', { count: trunks.length })}</p>
                    </div>
                    <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
                        <Plus className="w-4 h-4" />{t('trunks.addTrunk')}
                    </button>
                </div>

                <div className="flex flex-wrap gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('trunks.searchPlaceholder')}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none w-64"
                        />
                    </div>
                    {search && (
                        <button onClick={() => setSearch('')} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                            <X className="w-3 h-3" />{t('common.clear')}
                        </button>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700/60 border-b border-gray-200 dark:border-gray-600">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('trunks.name')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('trunks.host')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('trunks.did')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('trunks.status')}</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                                <Globe className="w-10 h-10 opacity-30" />
                                                <p className="text-sm">{t('trunks.notFound')}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filtered.map(trunk => (
                                    <tr key={trunk.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-900 dark:text-white">{trunk.name}</div>
                                            <div className="text-xs text-gray-500">{trunk.transport} / {trunk.context}</div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 font-mono">
                                            {trunk.host}:{trunk.port}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                            {trunk.did || <span className="text-gray-400">—</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            {trunk.is_active ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                                                    <CheckCircle2 className="w-3 h-3" /> {t('trunks.active')}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                                                    <XCircle className="w-3 h-3" /> {t('trunks.inactive')}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => openEdit(trunk)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(trunk.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) setIsOpen(false); }}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700">
                        <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {editingTrunk ? t('trunks.editTrunk') : t('trunks.newTrunk')}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('trunks.name')}</label>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" required />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('trunks.host')}</label>
                                <input type="text" value={data.host} onChange={e => setData('host', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" required />
                                {errors.host && <p className="text-red-500 text-xs mt-1">{errors.host}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('trunks.port')}</label>
                                <input type="number" value={data.port} onChange={e => setData('port', parseInt(e.target.value))} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('trunks.username')}</label>
                                <input type="text" value={data.username} onChange={e => setData('username', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('trunks.password')}</label>
                                <input type="password" value={data.password} onChange={e => setData('password', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('trunks.did')}</label>
                                <input type="text" value={data.did} onChange={e => setData('did', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('trunks.transport')}</label>
                                <select value={data.transport} onChange={e => setData('transport', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none">
                                    <option value="transport-udp">{t('trunks.udp')}</option>
                                    <option value="transport-tcp">{t('trunks.tcp')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('trunks.context')}</label>
                                <input type="text" value={data.context} onChange={e => setData('context', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="is_active" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                                <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('trunks.active')}</label>
                            </div>
                            <div className="col-span-2 flex gap-2 pt-4">
                                <button type="submit" disabled={processing} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors">
                                    {processing ? t('common.saving') : editingTrunk ? t('common.save') : t('common.create')}
                                </button>
                                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                                    {t('common.cancel')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
