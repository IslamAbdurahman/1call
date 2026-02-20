import { Head, useForm, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { Pencil, Trash2, Plus, Search, Headset, X, Wifi, WifiOff } from 'lucide-react';

interface Operator {
    id: number;
    name: string;
    extension: string;
    password?: string;
    group_id?: number;
    group?: { id: number; name: string };
}

interface Group {
    id: number;
    name: string;
}

export default function OperatorsIndex({ operators, groups, onlineExtensions = [] }: { operators: Operator[]; groups: Group[]; onlineExtensions: string[] }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '', extension: '', password: '', group_id: '',
    });
    const [editingOperator, setEditingOperator] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [groupFilter, setGroupFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const isOnline = (extension: string) => onlineExtensions.includes(extension);

    const filtered = operators.filter(op => {
        const matchSearch = !search ||
            op.name.toLowerCase().includes(search.toLowerCase()) ||
            op.extension.includes(search);
        const matchGroup = !groupFilter || op.group_id?.toString() === groupFilter;
        const matchStatus = !statusFilter ||
            (statusFilter === 'online' && isOnline(op.extension)) ||
            (statusFilter === 'offline' && !isOnline(op.extension));
        return matchSearch && matchGroup && matchStatus;
    });

    const onlineCount = operators.filter(op => isOnline(op.extension)).length;
    const offlineCount = operators.length - onlineCount;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingOperator) {
            router.put(`/operators/${editingOperator.id}`, { ...data }, {
                onSuccess: () => { setIsOpen(false); reset(); setEditingOperator(null); }
            });
        } else {
            post('/operators', { onSuccess: () => { setIsOpen(false); reset(); } });
        }
    };

    const openEdit = (op: Operator) => {
        setEditingOperator(op);
        setData({ name: op.name, extension: op.extension, password: op.password || '', group_id: op.group_id?.toString() || '' });
        setIsOpen(true);
    };

    const openCreate = () => {
        setEditingOperator(null);
        setData({ name: '', extension: '', password: '', group_id: '' });
        setIsOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm(t('operators.deleteConfirm'))) {
            router.delete(`/operators/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: t('operators.title'), href: '/operators' }]}>
            <Head title={t('operators.title')} />
            <div className="p-4 space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('operators.title')}</h1>
                        <div className="flex items-center gap-3 mt-1">
                            <p className="text-sm text-gray-500">{t('operators.total', { count: operators.length })}</p>
                            <span className="text-gray-300 dark:text-gray-600">|</span>
                            <div className="flex items-center gap-1.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <span className="text-sm text-green-600 dark:text-green-400 font-medium">{onlineCount}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="inline-flex rounded-full h-2 w-2 bg-gray-300 dark:bg-gray-600"></span>
                                <span className="text-sm text-gray-400 font-medium">{offlineCount}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
                        <Plus className="w-4 h-4" />{t('operators.addOperator')}
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('operators.searchPlaceholder')}
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
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        <option value="">{t('operators.allStatuses')}</option>
                        <option value="online">{t('operators.online')}</option>
                        <option value="offline">{t('operators.offline')}</option>
                    </select>
                    {(search || groupFilter || statusFilter) && (
                        <button onClick={() => { setSearch(''); setGroupFilter(''); setStatusFilter(''); }} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
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
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('common.name')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('operators.extension')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('common.group')}</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('operators.status')}</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                                <Headset className="w-10 h-10 opacity-30" />
                                                <p className="text-sm">{t('operators.notFound')}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filtered.map(op => {
                                    const online = isOnline(op.extension);
                                    return (
                                        <tr key={op.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                                            <td className="px-4 py-3 text-xs text-gray-400 font-mono">{op.id}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="relative">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-300 text-xs font-bold">
                                                            {op.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        {/* Small status dot on avatar */}
                                                        <span className={`absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-gray-800 ${online ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                                                    </div>
                                                    <span className="font-medium text-gray-900 dark:text-white">{op.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-700 dark:text-gray-200">{op.extension}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {op.group ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                                                        {op.group.name}
                                                    </span>
                                                ) : <span className="text-gray-400 text-xs">—</span>}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {online ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                                                        <span className="relative flex h-1.5 w-1.5">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                                                        </span>
                                                        {t('operators.online')}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-500 dark:bg-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
                                                        <span className="inline-flex rounded-full h-1.5 w-1.5 bg-gray-300 dark:bg-gray-500"></span>
                                                        {t('operators.offline')}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => openEdit(op)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(op.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
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
                                {editingOperator ? t('operators.editOperator') : t('operators.newOperator')}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {[
                                { id: 'name', label: t('common.name'), placeholder: t('operators.operatorName'), key: 'name' as const },
                                { id: 'extension', label: t('operators.extensionLabel'), placeholder: t('operators.extensionPlaceholder'), key: 'extension' as const },
                                { id: 'password', label: t('operators.sipPassword'), placeholder: t('operators.passwordPlaceholder'), key: 'password' as const },
                            ].map(f => (
                                <div key={f.id}>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{f.label}</label>
                                    <input
                                        type={f.key === 'password' ? 'password' : 'text'}
                                        value={data[f.key]}
                                        onChange={e => setData(f.key, e.target.value)}
                                        placeholder={f.placeholder}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                    {errors[f.key] && <p className="text-red-500 text-xs mt-1">{errors[f.key]}</p>}
                                </div>
                            ))}
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
                                    {processing ? t('common.saving') : editingOperator ? t('common.save') : t('common.create')}
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
