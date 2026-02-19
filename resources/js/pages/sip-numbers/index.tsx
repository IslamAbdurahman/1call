import { Head, useForm, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { Pencil, Trash2, Plus, Search, Phone, X } from 'lucide-react';

interface SipNumber {
    id: number;
    number: string;
    group_id?: number;
    group?: { id: number; name: string };
}

interface Group {
    id: number;
    name: string;
}

export default function SipNumbersIndex({ sipNumbers, groups }: { sipNumbers: SipNumber[]; groups: Group[] }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, reset, errors } = useForm({ number: '', group_id: '' });
    const [editingSip, setEditingSip] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [groupFilter, setGroupFilter] = useState('');

    const filtered = sipNumbers.filter(s => {
        const matchSearch = !search || s.number.includes(search);
        const matchGroup = !groupFilter || s.group_id?.toString() === groupFilter;
        return matchSearch && matchGroup;
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingSip) {
            router.put(`/sip-numbers/${editingSip.id}`, { ...data }, {
                onSuccess: () => { setIsOpen(false); reset(); setEditingSip(null); }
            });
        } else {
            post('/sip-numbers', { onSuccess: () => { setIsOpen(false); reset(); } });
        }
    };

    const openEdit = (sip: SipNumber) => {
        setEditingSip(sip);
        setData({ number: sip.number, group_id: sip.group_id?.toString() || '' });
        setIsOpen(true);
    };

    const openCreate = () => {
        setEditingSip(null);
        setData({ number: '', group_id: '' });
        setIsOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm(t('sipNumbers.deleteConfirm'))) {
            router.delete(`/sip-numbers/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: t('sipNumbers.title'), href: '/sip-numbers' }]}>
            <Head title={t('sipNumbers.title')} />
            <div className="p-4 space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('sipNumbers.title')}</h1>
                        <p className="text-sm text-gray-500 mt-0.5">{t('sipNumbers.total', { count: sipNumbers.length })}</p>
                    </div>
                    <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
                        <Plus className="w-4 h-4" />{t('sipNumbers.addSip')}
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('sipNumbers.searchPlaceholder')}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none w-56"
                        />
                    </div>
                    <select
                        value={groupFilter}
                        onChange={e => setGroupFilter(e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        <option value="">{t('common.allGroups')}</option>
                        {groups.map(g => <option key={g.id} value={g.id.toString()}>{g.name}</option>)}
                    </select>
                    {(search || groupFilter) && (
                        <button onClick={() => { setSearch(''); setGroupFilter(''); }} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                            <X className="w-3 h-3" />{t('common.clear')}
                        </button>
                    )}
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700/60 border-b border-gray-200 dark:border-gray-600">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">{t('common.id')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('sipNumbers.number')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('common.group')}</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                                <Phone className="w-10 h-10 opacity-30" />
                                                <p className="text-sm">{t('sipNumbers.notFound')}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filtered.map(sip => (
                                    <tr key={sip.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                                        <td className="px-4 py-3 text-xs text-gray-400 font-mono">{sip.id}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                                                    <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <span className="font-mono font-medium text-gray-900 dark:text-white">{sip.number}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {sip.group ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                                                    {sip.group.name}
                                                </span>
                                            ) : <span className="text-gray-400 text-xs">—</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => openEdit(sip)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(sip.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors">
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

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) { setIsOpen(false); reset(); } }}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
                        <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {editingSip ? t('sipNumbers.editSip') : t('sipNumbers.newSip')}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('sipNumbers.number')}</label>
                                <input
                                    type="text"
                                    value={data.number}
                                    onChange={e => setData('number', e.target.value)}
                                    placeholder={t('sipNumbers.sipNumber')}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    autoFocus
                                />
                                {errors.number && <p className="text-red-500 text-xs mt-1">{errors.number}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('common.group')}</label>
                                <select
                                    value={data.group_id}
                                    onChange={e => setData('group_id', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="">{t('common.selectGroup')}</option>
                                    {groups.map(g => <option key={g.id} value={g.id.toString()}>{g.name}</option>)}
                                </select>
                                {errors.group_id && <p className="text-red-500 text-xs mt-1">{errors.group_id}</p>}
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="submit" disabled={processing} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors">
                                    {processing ? t('common.saving') : editingSip ? t('common.save') : t('common.create')}
                                </button>
                                <button type="button" onClick={() => { setIsOpen(false); reset(); }} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
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
