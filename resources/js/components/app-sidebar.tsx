import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Folder, LayoutGrid, Users, Headset, Phone, Contact, FileText, History } from 'lucide-react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { t } = useTranslation();

    const mainNavItems: NavItem[] = [
        { title: t('sidebar.dashboard'), href: '/dashboard', icon: LayoutGrid },
        { title: t('sidebar.groups'), href: '/groups', icon: Users },
        { title: t('sidebar.operators'), href: '/operators', icon: Headset },
        { title: t('sidebar.sipNumbers'), href: '/sip-numbers', icon: Phone },
        { title: t('sidebar.contacts'), href: '/contacts', icon: Contact },
        { title: t('sidebar.callLogs'), href: '/call-logs', icon: FileText },
        { title: t('sidebar.callHistory'), href: '/call-histories', icon: History },
    ];

    const footerNavItems: NavItem[] = [
        { title: t('sidebar.repository'), href: 'https://github.com/laravel/react-starter-kit', icon: Folder },
        { title: t('sidebar.documentation'), href: 'https://laravel.com/docs/starter-kits#react', icon: BookOpen },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <div className="px-2 py-1">
                    <LanguageSwitcher />
                </div>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
