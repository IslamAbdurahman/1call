import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const languages = [
    { code: 'uz', label: "O'zbekcha", flag: '🇺🇿' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
] as const;

export function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const currentLang = languages.find((l) => l.code === i18n.language) ?? languages[0];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 cursor-pointer px-2 text-sidebar-foreground/70 hover:text-sidebar-foreground"
                    title={currentLang.label}
                >
                    <Globe className="h-4 w-4 shrink-0" />
                    <span className="truncate text-sm">{currentLang.flag} {currentLang.label}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="right" className="min-w-[160px]">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => i18n.changeLanguage(lang.code)}
                        className={`cursor-pointer gap-2 ${i18n.language === lang.code
                            ? 'bg-accent font-medium'
                            : ''
                            }`}
                    >
                        <span className="text-base leading-none">{lang.flag}</span>
                        <span>{lang.label}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
