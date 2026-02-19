import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import {
    Users, Headset, Phone, Contact, History, PhoneIncoming,
    PhoneMissed, TrendingUp, Activity,
} from 'lucide-react';

interface Stats {
    groups: number;
    operators: number;
    sipNumbers: number;
    contacts: number;
    callsToday: number;
    callsAnswered: number;
    callsMissed: number;
}

export default function Dashboard({ stats }: { stats?: Stats }) {
    const { t } = useTranslation();
    const s: Stats = stats ?? { groups: 0, operators: 0, sipNumbers: 0, contacts: 0, callsToday: 0, callsAnswered: 0, callsMissed: 0 };

    const breadcrumbs: BreadcrumbItem[] = [{ title: t('dashboard.title'), href: dashboard().url }];

    const statCards = [
        { label: t('dashboard.groups'), value: s.groups, icon: Users, color: 'bg-indigo-500', light: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300', href: '/groups' },
        { label: t('dashboard.operators'), value: s.operators, icon: Headset, color: 'bg-purple-500', light: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300', href: '/operators' },
        { label: t('dashboard.sipNumbers'), value: s.sipNumbers, icon: Phone, color: 'bg-emerald-500', light: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300', href: '/sip-numbers' },
        { label: t('dashboard.contacts'), value: s.contacts, icon: Contact, color: 'bg-blue-500', light: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300', href: '/contacts' },
        { label: t('dashboard.callsToday'), value: s.callsToday, icon: Activity, color: 'bg-orange-500', light: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300', href: '/call-histories' },
        { label: t('dashboard.callsAnswered'), value: s.callsAnswered, icon: PhoneIncoming, color: 'bg-teal-500', light: 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-300', href: '/call-histories' },
        { label: t('dashboard.callsMissed'), value: s.callsMissed, icon: PhoneMissed, color: 'bg-red-500', light: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300', href: '/call-histories' },
        { label: t('dashboard.callHistory'), value: null, icon: History, color: 'bg-gray-500', light: 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300', href: '/call-histories', cta: t('dashboard.viewAll') },
    ];

    const quickAccessItems = [
        { label: t('dashboard.callHistory'), href: '/call-histories', icon: History, desc: t('dashboard.allCalls') },
        { label: t('dashboard.operators'), href: '/operators', icon: Headset, desc: t('dashboard.operatorManagement') },
        { label: t('dashboard.contacts'), href: '/contacts', icon: Contact, desc: t('dashboard.contactsList') },
        { label: t('dashboard.sipNumbers'), href: '/sip-numbers', icon: Phone, desc: t('dashboard.lines') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('dashboard.title')} />
            <div className="p-4 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboard.title')}</h1>
                    <p className="text-sm text-gray-500 mt-0.5">{t('dashboard.subtitle')}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((card, i) => {
                        const Icon = card.icon;
                        return (
                            <Link
                                key={i}
                                href={card.href}
                                className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex items-center gap-4 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200"
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${card.light}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{card.label}</p>
                                    {card.value !== null ? (
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                                    ) : (
                                        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline">{card.cta}</p>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Quick access */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-indigo-500" />
                        <h2 className="font-semibold text-gray-900 dark:text-white">{t('dashboard.quickAccess')}</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {quickAccessItems.map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <Link key={i} href={item.href} className="flex flex-col items-start p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-200 dark:hover:border-indigo-700 transition-all group">
                                    <Icon className="w-5 h-5 text-indigo-500 mb-2" />
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
