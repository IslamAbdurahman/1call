import { Head, useForm, router } from '@inertiajs/react';
import { Network, PhoneCall, ServerCog, Plus, Trash2, RefreshCw, Power } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import type { BreadcrumbItem } from '@/types';

interface Dialplan {
    id: number;
    exten: string;
    context: string;
    app: string;
}

interface NetworkConfig {
    ip: string;
    mask: string;
    gateway: string;
}

interface AsteriskStatus {
    running: boolean;
    version: string;
    activeCalls: number;
    endpoints: Array<{ name: string; state: string; channels: string }>;
}

export default function ServerSettings({
    dialplans,
    network,
    asterisk,
}: {
    dialplans: Dialplan[];
    network: NetworkConfig;
    asterisk: AsteriskStatus;
}) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'dialplan' | 'network' | 'asterisk'>('dialplan');

    // Dialplan form
    const { data: dpData, setData: setDpData, post: dpPost, processing: dpProcessing, reset: dpReset, errors: dpErrors } = useForm({
        exten: '',
        context: 'from-external',
    });

    // Network form
    const { data: netData, setData: setNetData, put: netPut, processing: netProcessing, errors: netErrors } = useForm({
        ip: network.ip || '',
        mask: network.mask || '255.255.255.128',
        gateway: network.gateway || '',
    });

    const handleDialplanSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dpPost('/settings/server/dialplan', {
            onSuccess: () => dpReset('exten'),
        });
    };

    const handleDialplanDelete = (exten: string) => {
        if (confirm(t('settings.server.confirmDeleteDID'))) {
            router.delete(`/settings/server/dialplan/${exten}`);
        }
    };

    const handleNetworkSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (confirm(t('settings.server.confirmNetwork'))) {
            netPut('/settings/server/network');
        }
    };

    const runCommand = (cmd: 'reload' | 'restart') => {
        if (confirm(t('settings.server.confirmCommand'))) {
            router.post('/settings/server/asterisk/command', { command: cmd });
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('settings.server.title'), href: '/settings/server' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('settings.server.title')} />

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title={t('settings.server.title')}
                        description={t('settings.server.description')}
                    />

                    {/* Tabs */}
                    <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('dialplan')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                                activeTab === 'dialplan'
                                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }`}
                        >
                            <PhoneCall className="w-4 h-4" />
                            {t('settings.server.tabs.dialplan')}
                        </button>
                        <button
                            onClick={() => setActiveTab('network')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                                activeTab === 'network'
                                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }`}
                        >
                            <Network className="w-4 h-4" />
                            {t('settings.server.tabs.network')}
                        </button>
                        <button
                            onClick={() => setActiveTab('asterisk')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                                activeTab === 'asterisk'
                                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }`}
                        >
                            <ServerCog className="w-4 h-4" />
                            {t('settings.server.tabs.asterisk')}
                        </button>
                    </div>

                    {/* Content */}
                    <div className="mt-6">
                        {activeTab === 'dialplan' && (
                            <div className="space-y-6">
                                <form onSubmit={handleDialplanSubmit} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{t('settings.server.dialplan.addDID')}</h3>
                                    <div className="flex items-end gap-3">
                                        <div className="flex-1">
                                            <Label htmlFor="exten">{t('settings.server.dialplan.didNumber')}</Label>
                                            <Input
                                                id="exten"
                                                value={dpData.exten}
                                                onChange={e => setDpData('exten', e.target.value)}
                                                className="mt-1"
                                                placeholder="558121222"
                                                required
                                            />
                                            {dpErrors.exten && <p className="text-red-500 text-xs mt-1">{dpErrors.exten}</p>}
                                        </div>
                                        <div className="flex-1">
                                            <Label htmlFor="context">{t('settings.server.dialplan.context')}</Label>
                                            <Input
                                                id="context"
                                                value={dpData.context}
                                                onChange={e => setDpData('context', e.target.value)}
                                                className="mt-1"
                                                required
                                            />
                                            {dpErrors.context && <p className="text-red-500 text-xs mt-1">{dpErrors.context}</p>}
                                        </div>
                                        <Button type="submit" disabled={dpProcessing} className="mb-0.5">
                                            <Plus className="w-4 h-4 mr-2" />
                                            {t('common.add')}
                                        </Button>
                                    </div>
                                </form>

                                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 dark:bg-gray-700/60 border-b border-gray-200 dark:border-gray-600">
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('settings.server.dialplan.didNumber')}</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('settings.server.dialplan.action')}</th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('common.actions')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {dialplans.length === 0 ? (
                                                <tr>
                                                    <td colSpan={3} className="px-4 py-8 text-center text-gray-500">{t('settings.server.dialplan.noData')}</td>
                                                </tr>
                                            ) : dialplans.map(dp => (
                                                <tr key={dp.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{dp.exten}</td>
                                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                                        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Stasis(1call)</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button onClick={() => handleDialplanDelete(dp.exten)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'network' && (
                            <form onSubmit={handleNetworkSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500 mb-4 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-sm">
                                    {t('settings.server.network.warning')}
                                </div>
                                
                                <div className="grid gap-4">
                                    <div>
                                        <Label htmlFor="ip">{t('settings.server.network.ipAddress')} (eth1)</Label>
                                        <Input
                                            id="ip"
                                            value={netData.ip}
                                            onChange={e => setNetData('ip', e.target.value)}
                                            className="mt-1"
                                            placeholder="10.17.160.229"
                                            required
                                        />
                                        {netErrors.ip && <p className="text-red-500 text-xs mt-1">{netErrors.ip}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="mask">{t('settings.server.network.subnetMask')}</Label>
                                        <Input
                                            id="mask"
                                            value={netData.mask}
                                            onChange={e => setNetData('mask', e.target.value)}
                                            className="mt-1"
                                            placeholder="255.255.255.128"
                                            required
                                        />
                                        {netErrors.mask && <p className="text-red-500 text-xs mt-1">{netErrors.mask}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="gateway">{t('settings.server.network.gateway')}</Label>
                                        <Input
                                            id="gateway"
                                            value={netData.gateway}
                                            onChange={e => setNetData('gateway', e.target.value)}
                                            className="mt-1"
                                            placeholder="10.17.160.129"
                                            required
                                        />
                                        {netErrors.gateway && <p className="text-red-500 text-xs mt-1">{netErrors.gateway}</p>}
                                    </div>
                                </div>

                                <Button type="submit" disabled={netProcessing} className="w-full sm:w-auto">
                                    {t('settings.server.network.apply')}
                                </Button>
                            </form>
                        )}

                        {activeTab === 'asterisk' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.server.asterisk.status')}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className={`w-2.5 h-2.5 rounded-full ${asterisk.running ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    {asterisk.running ? t('settings.server.asterisk.running') : t('settings.server.asterisk.stopped')}
                                                </p>
                                            </div>
                                            {asterisk.version && (
                                                <p className="text-xs text-gray-500 mt-2 truncate w-48" title={asterisk.version}>
                                                    {asterisk.version}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.server.asterisk.activeCalls')}</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{asterisk.activeCalls}</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button onClick={() => runCommand('reload')} variant="outline" className="flex items-center gap-2">
                                        <RefreshCw className="w-4 h-4" />
                                        {t('settings.server.asterisk.reloadDialplan')}
                                    </Button>
                                    <Button onClick={() => runCommand('restart')} variant="destructive" className="flex items-center gap-2">
                                        <Power className="w-4 h-4" />
                                        {t('settings.server.asterisk.restart')}
                                    </Button>
                                </div>

                                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
                                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('settings.server.asterisk.endpoints')}</h3>
                                    </div>
                                    <table className="w-full text-sm">
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {asterisk.endpoints.length === 0 ? (
                                                <tr>
                                                    <td colSpan={3} className="px-4 py-6 text-center text-gray-500">{t('settings.server.asterisk.noEndpoints')}</td>
                                                </tr>
                                            ) : asterisk.endpoints.map((ep, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{ep.name}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                            ep.state.toLowerCase().includes('avail') || ep.state.toLowerCase().includes('not in use')
                                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                                : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                                                        }`}>
                                                            {ep.state}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-gray-500">{ep.channels}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
