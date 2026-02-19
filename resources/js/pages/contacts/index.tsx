import { Head, useForm, router, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { Pencil, Trash2, Plus, Search, Contact, X } from 'lucide-react';

interface ContactItem {
    id: number;
    name: string;
    phone: string;
    group_id?: number;
    group?: { id: number; name: string };
}

interface Group {
    id: number;
    name: string;
}

export default function ContactsIndex({ contacts, groups }: { contacts: any; groups: Group[] }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '', phone: '', group_id: '',
    });
    const [editingContact, setEditingContact] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [groupFilter, setGroupFilter] = useState('');

    const filtered = contacts.data.filter((c: ContactItem) => {
        const matchSearch = !search ||
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.phone.includes(search);
        const matchGroup = !groupFilter || c.group_id?.toString() === groupFilter;
        return matchSearch && matchGroup;
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingContact) {
            router.put(`/contacts/${editingContact.id}`, { ...data }, {
                onSuccess: () => { setIsOpen(false); reset(); setEditingContact(null); }
            });
        } else {
            post('/contacts', { onSuccess: () => { setIsOpen(false); reset(); } });
        }
    };

    const openEdit = (contact: ContactItem) => {
        setEditingContact(contact);
        setData({ name: contact.name, phone: contact.phone, group_id: contact.group_id?.toString() || '' });
        setIsOpen(true);
    };

    const openCreate = () => {
        setEditingContact(null);
        setData({ name: '', phone: '', group_id: '' });
        setIsOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm(t('contacts.deleteConfirm'))) {
            router.delete(`/contacts/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: t('contacts.title'), href: '/contacts' }]}>
            <Head title={t('contacts.title')} />
            <div className="p-4 space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('contacts.title')}</h1>
                        <p className="text-sm text-gray-500 mt-0.5">{t('contacts.total', { count: contacts.total })}</p>
                    </div>
                    <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
                        <Plus className="w-4 h-4" />{t('contacts.addContact')}
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('contacts.searchPlaceholder')}
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
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('common.name')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('contacts.phone')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('common.group')}</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                                <Contact className="w-10 h-10 opacity-30" />
                                                <p className="text-sm">{t('contacts.notFound')}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filtered.map((contact: ContactItem) => (
                                    <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                                        <td className="px-4 py-3 text-xs text-gray-400 font-mono">{contact.id}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold">
                                                    {contact.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-gray-900 dark:text-white">{contact.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-sm text-gray-700 dark:text-gray-200">{contact.phone}</td>
                                        <td className="px-4 py-3">
                                            {contact.group ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                                                    {contact.group.name}
                                                </span>
                                            ) : <span className="text-gray-400 text-xs">—</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => openEdit(contact)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(contact.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {contacts.last_page > 1 && (
                        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <span>{contacts.from ?? 0} – {contacts.to ?? 0} / {contacts.total}</span>
                            <div className="flex flex-wrap gap-1">
                                {contacts.links.map((link: any, i: number) => (
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

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) { setIsOpen(false); reset(); } }}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
                        <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {editingContact ? t('contacts.editContact') : t('contacts.newContact')}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {[
                                { id: 'name', label: t('common.name'), placeholder: t('contacts.contactName'), key: 'name' as const },
                                { id: 'phone', label: t('contacts.phone'), placeholder: t('contacts.phonePlaceholder'), key: 'phone' as const },
                            ].map(f => (
                                <div key={f.id}>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{f.label}</label>
                                    <input
                                        type="text"
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
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="submit" disabled={processing} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors">
                                    {processing ? t('common.saving') : editingContact ? t('common.save') : t('common.create')}
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
