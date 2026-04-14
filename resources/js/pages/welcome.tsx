import { Head, Link, usePage } from '@inertiajs/react';
import {
    Phone,
    Headset,
    BarChart3,
    Users,
    Shield,
    Zap,
    Globe,
    ChevronDown,
    PhoneCall,
    PhoneIncoming,
    PhoneOutgoing,
    Clock,
    CheckCircle2,
    ArrowRight,
    Mic,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { dashboard, login, register } from '@/routes';

// ─── Translations ────────────────────────────────────────────
const translations = {
    uz: {
        nav: { login: 'Kirish', register: "Ro'yxatdan o'tish", dashboard: 'Boshqaruv paneli' },
        hero: {
            badge: '🚀 Zamonaviy Call Center platformasi',
            title: 'Call Centerni',
            titleHighlight: 'aqlli boshqaring',
            subtitle: "Barcha qo'ng'iroqlarni bir joydan boshqaring. Real-time monitoring, yozib olish, analitika va ko'p tillilik — barchasi bitta platformada.",
            cta: "Boshlash",
            ctaSecondary: "Batafsil ma'lumot",
        },
        stats: {
            calls: "Kunlik qo'ng'iroqlar",
            operators: 'Faol operatorlar',
            uptime: 'Ishonchlilik',
            satisfaction: 'Mijozlar mamnuniyati',
        },
        features: {
            title: "Imkoniyatlar",
            subtitle: "1Call bilan siz nimalar qila olasiz",
            items: [
                { title: "Aqlli marshrutlash", desc: "Qo'ng'iroqlarni avtomatik ravishda bo'sh operatorlarga yo'naltirish" },
                { title: "Real-time monitoring", desc: "Barcha qo'ng'iroqlarni jonli kuzatish va boshqarish" },
                { title: "Qo'ng'iroq yozish", desc: "Barcha suhbatlarni avtomatik yozib olish va saqlash" },
                { title: "Analitika", desc: "Batafsil statistika va hisobotlar bilan samaradorlikni oshirish" },
                { title: "Ko'p tillilik", desc: "O'zbek, Rus va Ingliz tillarida to'liq interfeys" },
                { title: "Xavfsizlik", desc: "Ma'lumotlar shifrlangan va himoyalangan" },
            ],
        },
        footer: {
            rights: "Barcha huquqlar himoyalangan.",
            madeWith: "❤️ bilan yaratilgan",
        },
    },
    ru: {
        nav: { login: 'Войти', register: 'Регистрация', dashboard: 'Панель управления' },
        hero: {
            badge: '🚀 Современная платформа Call Center',
            title: 'Умное управление',
            titleHighlight: 'Call Центром',
            subtitle: 'Управляйте всеми звонками из одного места. Мониторинг в реальном времени, запись разговоров, аналитика и многоязычность — всё на одной платформе.',
            cta: 'Начать',
            ctaSecondary: 'Подробнее',
        },
        stats: {
            calls: 'Звонков в день',
            operators: 'Активных операторов',
            uptime: 'Надёжность',
            satisfaction: 'Удовлетворённость',
        },
        features: {
            title: "Возможности",
            subtitle: "Что вы можете делать с 1Call",
            items: [
                { title: 'Умная маршрутизация', desc: 'Автоматическое перенаправление звонков свободным операторам' },
                { title: 'Мониторинг в реальном времени', desc: 'Отслеживайте и управляйте всеми звонками вживую' },
                { title: 'Запись разговоров', desc: 'Автоматическая запись и хранение всех разговоров' },
                { title: 'Аналитика', desc: 'Подробная статистика и отчёты для повышения эффективности' },
                { title: 'Многоязычность', desc: 'Полный интерфейс на узбекском, русском и английском языках' },
                { title: 'Безопасность', desc: 'Данные зашифрованы и защищены' },
            ],
        },
        footer: {
            rights: 'Все права защищены.',
            madeWith: 'Сделано с ❤️',
        },
    },
    en: {
        nav: { login: 'Log in', register: 'Register', dashboard: 'Dashboard' },
        hero: {
            badge: '🚀 Modern Call Center Platform',
            title: 'Smart Call Center',
            titleHighlight: 'Management',
            subtitle: 'Manage all your calls from one place. Real-time monitoring, call recording, analytics and multilingual support — all in one platform.',
            cta: 'Get Started',
            ctaSecondary: 'Learn More',
        },
        stats: {
            calls: 'Daily Calls',
            operators: 'Active Operators',
            uptime: 'Uptime',
            satisfaction: 'Satisfaction',
        },
        features: {
            title: 'Features',
            subtitle: 'What you can do with 1Call',
            items: [
                { title: 'Smart Routing', desc: 'Automatically route calls to available operators' },
                { title: 'Real-time Monitoring', desc: 'Track and manage all calls live' },
                { title: 'Call Recording', desc: 'Automatically record and store all conversations' },
                { title: 'Analytics', desc: 'Detailed statistics and reports to boost efficiency' },
                { title: 'Multilingual', desc: 'Full interface in Uzbek, Russian and English' },
                { title: 'Security', desc: 'Data is encrypted and protected' },
            ],
        },
        footer: {
            rights: 'All rights reserved.',
            madeWith: 'Made with ❤️',
        },
    },
} as const;

type Lang = keyof typeof translations;

const langLabels: Record<Lang, { label: string; flag: string }> = {
    uz: { label: "O'zbekcha", flag: '🇺🇿' },
    ru: { label: 'Русский', flag: '🇷🇺' },
    en: { label: 'English', flag: '🇬🇧' },
};

// ─── Animated Counter Component ────────────────────────────
function AnimatedCounter({ end, suffix = '' }: { end: number; suffix?: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const started = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started.current) {
                    started.current = true;
                    const duration = 2000;
                    const startTime = performance.now();
                    const animate = (now: number) => {
                        const elapsed = now - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        setCount(Math.floor(eased * end));
                        if (progress < 1) requestAnimationFrame(animate);
                    };
                    requestAnimationFrame(animate);
                }
            },
            { threshold: 0.3 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [end]);

    return (
        <span ref={ref}>
            {count}
            {suffix}
        </span>
    );
}

interface Particle {
    id: number;
    width: string;
    height: string;
    left: string;
    top: string;
    background: string;
    animation: string;
    animationDelay: string;
}

// ─── Floating Particles ─────────────────────────────────────
function FloatingParticles() {
    const [particles, setParticles] = useState<Particle[]>([]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setParticles(Array.from({ length: 20 }).map((_, i) => ({
                id: i,
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `hsl(${210 + Math.random() * 60}, 80%, 70%)`,
                animation: `float ${6 + Math.random() * 8}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
            })));
        }, 0);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="absolute rounded-full opacity-20"
                    style={{
                        width: particle.width,
                        height: particle.height,
                        left: particle.left,
                        top: particle.top,
                        background: particle.background,
                        animation: particle.animation,
                        animationDelay: particle.animationDelay,
                    }}
                />
            ))}
        </div>
    );
}

// ─── Feature Icons ─────────────────────────────────────────
const featureIcons = [Zap, PhoneCall, Mic, BarChart3, Globe, Shield];

// ─── Main Component ─────────────────────────────────────────
export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    const { auth } = usePage().props;
    const [lang, setLang] = useState<Lang>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('welcome_lang') as Lang) || 'uz';
        }
        return 'uz';
    });
    const [langOpen, setLangOpen] = useState(false);
    const [scrollY, setScrollY] = useState(0);

    const t = translations[lang];

    useEffect(() => {
        localStorage.setItem('welcome_lang', lang);
    }, [lang]);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToFeatures = () => {
        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <>
            <Head title="1Call — Call Center Platform">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=inter:300,400,500,600,700,800,900"
                    rel="stylesheet"
                />
                <meta name="description" content="1Call — zamonaviy call center platformasi. Barcha qo'ng'iroqlarni bir joydan boshqaring." />
            </Head>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) translateX(0); }
                    25% { transform: translateY(-20px) translateX(10px); }
                    50% { transform: translateY(-10px) translateX(-10px); }
                    75% { transform: translateY(-30px) translateX(5px); }
                }
                @keyframes pulse-ring {
                    0% { transform: scale(0.8); opacity: 0.8; }
                    50% { transform: scale(1.2); opacity: 0; }
                    100% { transform: scale(0.8); opacity: 0; }
                }
                @keyframes gradient-shift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slide-in-right {
                    from { opacity: 0; transform: translateX(30px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-slide-up { animation: slide-up 0.8s ease-out forwards; }
                .animate-slide-in-right { animation: slide-in-right 0.6s ease-out forwards; }
                .gradient-text {
                    background: linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .glass {
                    background: rgba(255,255,255,0.08);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255,255,255,0.12);
                }
                .glass-light {
                    background: rgba(255,255,255,0.7);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(0,0,0,0.08);
                }
                .hero-gradient {
                    background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
                }
                .card-hover {
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .card-hover:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 25px 60px -12px rgba(99,102,241,0.25);
                }
                .feature-icon-bg {
                    background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15));
                }
                body { font-family: 'Inter', sans-serif; }
            `}</style>

            <div className="min-h-screen bg-[#fafbff]" style={{ fontFamily: "'Inter', sans-serif" }}>

                {/* ═══ NAVIGATION ═══ */}
                <nav
                    className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 50
                        ? 'glass-light shadow-lg shadow-indigo-500/5'
                        : 'bg-transparent'
                        }`}
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            {/* Logo */}
                            <div className="flex items-center gap-2.5 group">
                                <div className="relative">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                                        <Phone className="h-5 w-5 text-white" strokeWidth={2.5} />
                                    </div>
                                    <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
                                </div>
                                <div className="flex items-center -ml-0.5">
                                    <span className="text-2xl font-black tracking-tighter text-indigo-600 mr-0.5">{t('welcome.brand').substring(0, 1)}</span>
                                    <span className="text-xl font-bold tracking-tight text-gray-900">
                                        <span className="gradient-text">{t('welcome.brand').substring(1)}</span>
                                    </span>
                                </div>
                            </div>

                            {/* Right side: Language + Auth */}
                            <div className="flex items-center gap-3">
                                {/* Language Switcher */}
                                <div className="relative">
                                    <button
                                        onClick={() => setLangOpen(!langOpen)}
                                        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md"
                                    >
                                        <span className="text-base">{langLabels[lang].flag}</span>
                                        <span className="hidden sm:inline">{langLabels[lang].label}</span>
                                        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {langOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                                            <div className="absolute right-0 top-full mt-2 z-50 min-w-[170px] overflow-hidden rounded-xl border border-gray-100 bg-white p-1 shadow-xl shadow-gray-200/50 animate-slide-up">
                                                {(Object.keys(langLabels) as Lang[]).map((code) => (
                                                    <button
                                                        key={code}
                                                        onClick={() => {
                                                            setLang(code);
                                                            setLangOpen(false);
                                                        }}
                                                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${lang === code
                                                            ? 'bg-indigo-50 text-indigo-700 font-semibold'
                                                            : 'text-gray-600 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        <span className="text-lg">{langLabels[code].flag}</span>
                                                        <span>{langLabels[code].label}</span>
                                                        {lang === code && <CheckCircle2 className="ml-auto h-4 w-4 text-indigo-500" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Auth buttons */}
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-[1.02]"
                                    >
                                        {t.nav.dashboard}
                                    </Link>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={login()}
                                            className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 bg-gray-50/50 transition-all hover:bg-white hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm"
                                        >
                                            {t.nav.login}
                                        </Link>
                                        {canRegister && (
                                            <Link
                                                href={register()}
                                                className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-[1.02]"
                                            >
                                                {t.nav.register}
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* ═══ HERO SECTION ═══ */}
                <section className="relative min-h-screen flex items-center overflow-hidden">
                    {/* Background */}
                    <div className="absolute inset-0 hero-gradient" />
                    <div
                        className="absolute inset-0 opacity-30"
                        style={{
                            backgroundImage: `
                                radial-gradient(circle at 20% 50%, rgba(99,102,241,0.3) 0%, transparent 50%),
                                radial-gradient(circle at 80% 20%, rgba(139,92,246,0.2) 0%, transparent 50%),
                                radial-gradient(circle at 50% 80%, rgba(168,85,247,0.15) 0%, transparent 50%)
                            `,
                        }}
                    />
                    <FloatingParticles />

                    {/* Decorative rings */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-white/5" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/5" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-white/8" />

                    <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-32">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            {/* Left: Text */}
                            <div className="animate-slide-up">
                                <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm text-indigo-200 mb-8">
                                    {t.hero.badge}
                                </div>
                                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
                                    {t.hero.title}
                                    <br />
                                    <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                        {t.hero.titleHighlight}
                                    </span>
                                </h1>
                                <p className="text-lg text-gray-300 leading-relaxed max-w-xl mb-10">
                                    {t.hero.subtitle}
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <Link
                                        href={auth.user ? dashboard() : login()}
                                        className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3.5 text-base font-semibold text-white shadow-2xl shadow-indigo-500/30 transition-all hover:shadow-3xl hover:shadow-indigo-500/40 hover:scale-[1.03]"
                                    >
                                        {t.hero.cta}
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                    <button
                                        onClick={scrollToFeatures}
                                        className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-white/10 hover:border-white/30"
                                    >
                                        {t.hero.ctaSecondary}
                                    </button>
                                </div>
                            </div>

                            {/* Right: Visual */}
                            <div className="hidden lg:block animate-slide-in-right">
                                <div className="relative">
                                    {/* floating phone icons */}
                                    <div className="absolute -top-8 -left-8 glass rounded-2xl p-4 animate-pulse" style={{ animationDuration: '3s' }}>
                                        <PhoneIncoming className="h-8 w-8 text-emerald-400" />
                                    </div>
                                    <div className="absolute -bottom-4 -right-4 glass rounded-2xl p-4 animate-pulse" style={{ animationDuration: '4s' }}>
                                        <PhoneOutgoing className="h-8 w-8 text-blue-400" />
                                    </div>
                                    <div className="absolute top-1/2 -right-12 glass rounded-2xl p-3 animate-pulse" style={{ animationDuration: '3.5s' }}>
                                        <Headset className="h-6 w-6 text-purple-400" />
                                    </div>

                                    {/* Main card */}
                                    <div className="glass rounded-3xl p-8" style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="h-3 w-3 rounded-full bg-red-400" />
                                            <div className="h-3 w-3 rounded-full bg-yellow-400" />
                                            <div className="h-3 w-3 rounded-full bg-green-400" />
                                            <span className="ml-3 text-sm text-gray-400 font-mono">1Call Dashboard</span>
                                        </div>

                                        {/* Mini dashboard mockup */}
                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="rounded-xl bg-white/5 p-4 border border-white/5">
                                                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                                                    <PhoneCall className="h-3.5 w-3.5" />
                                                    <span>Active</span>
                                                </div>
                                                <div className="text-2xl font-bold text-white">12</div>
                                            </div>
                                            <div className="rounded-xl bg-white/5 p-4 border border-white/5">
                                                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                                                    <Users className="h-3.5 w-3.5" />
                                                    <span>Online</span>
                                                </div>
                                                <div className="text-2xl font-bold text-emerald-400">8</div>
                                            </div>
                                            <div className="rounded-xl bg-white/5 p-4 border border-white/5">
                                                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    <span>Avg Wait</span>
                                                </div>
                                                <div className="text-2xl font-bold text-yellow-400">0:23</div>
                                            </div>
                                            <div className="rounded-xl bg-white/5 p-4 border border-white/5">
                                                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    <span>Today</span>
                                                </div>
                                                <div className="text-2xl font-bold text-indigo-400">247</div>
                                            </div>
                                        </div>

                                        {/* Mini call list */}
                                        <div className="space-y-2">
                                            {[
                                                { name: 'Alisher Umarov', num: '+998 90 123 45 67', status: 'active', color: 'emerald' },
                                                { name: 'Nodira Karimova', num: '+998 91 234 56 78', status: 'ringing', color: 'yellow' },
                                                { name: 'Jasur Toshmatov', num: '+998 93 345 67 89', status: 'hold', color: 'orange' },
                                            ].map((call, i) => (
                                                <div key={i} className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3 border border-white/5">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`h-2 w-2 rounded-full bg-${call.color}-400 ${call.status === 'ringing' ? 'animate-pulse' : ''}`} />
                                                        <div>
                                                            <div className="text-sm font-medium text-white">{call.name}</div>
                                                            <div className="text-xs text-gray-500 font-mono">{call.num}</div>
                                                        </div>
                                                    </div>
                                                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full ${call.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                                                        call.status === 'ringing' ? 'bg-yellow-500/20 text-yellow-400' :
                                                            'bg-orange-500/20 text-orange-400'
                                                        }`}>
                                                        {call.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Scroll indicator */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
                        <button onClick={scrollToFeatures} className="flex flex-col items-center gap-2 text-white/50 hover:text-white/80 transition-colors">
                            <ChevronDown className="h-5 w-5 animate-bounce" />
                        </button>
                    </div>
                </section>

                {/* ═══ STATS SECTION ═══ */}
                <section className="relative -mt-20 z-20">
                    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                            {[
                                { value: 500, suffix: '+', label: t.stats.calls, icon: PhoneCall, color: 'indigo' },
                                { value: 25, suffix: '+', label: t.stats.operators, icon: Headset, color: 'purple' },
                                { value: 99, suffix: '.9%', label: t.stats.uptime, icon: Zap, color: 'emerald' },
                                { value: 98, suffix: '%', label: t.stats.satisfaction, icon: CheckCircle2, color: 'pink' },
                            ].map((stat, i) => (
                                <div
                                    key={i}
                                    className="glass-light rounded-2xl p-6 text-center shadow-xl shadow-gray-200/30 card-hover"
                                >
                                    <stat.icon className={`mx-auto mb-3 h-6 w-6 text-${stat.color}-500`} />
                                    <div className="text-3xl font-bold text-gray-900 mb-1">
                                        <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                                    </div>
                                    <div className="text-sm text-gray-500">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══ FEATURES SECTION ═══ */}
                <section id="features" className="py-32">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <span className="inline-block rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-4">
                                {t.features.title}
                            </span>
                            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
                                {t.features.subtitle}
                            </h2>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {t.features.items.map((feature, i) => {
                                const Icon = featureIcons[i];
                                return (
                                    <div
                                        key={i}
                                        className="group rounded-2xl bg-white border border-gray-100 p-8 shadow-sm card-hover"
                                    >
                                        <div className="feature-icon-bg mb-5 inline-flex rounded-xl p-3.5 transition-colors group-hover:bg-gradient-to-br group-hover:from-indigo-500 group-hover:to-purple-600">
                                            <Icon className="h-6 w-6 text-indigo-600 transition-colors group-hover:text-white" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                        <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>


                {/* ═══ CTA SECTION ═══ */}
                <section className="py-24">
                    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                        <div className="relative overflow-hidden rounded-3xl hero-gradient p-12 lg:p-16 text-center">
                            <FloatingParticles />
                            <div className="relative z-10">
                                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 border border-white/20">
                                    <Phone className="h-8 w-8 text-white" />
                                </div>
                                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                                    {t.hero.cta}
                                </h2>
                                <p className="text-gray-300 mb-8 max-w-lg mx-auto">
                                    {t.hero.subtitle}
                                </p>
                                <Link
                                    href={auth.user ? dashboard() : login()}
                                    className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-indigo-700 shadow-2xl transition-all hover:scale-[1.03] hover:shadow-3xl"
                                >
                                    {t.hero.cta}
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══ FOOTER ═══ */}
                <footer className="border-t border-gray-100 bg-white py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                                    <Phone className="h-4 w-4 text-white" />
                                </div>
                                <div className="flex items-center">
                                    <span className="text-xl font-black tracking-tighter text-indigo-600 mr-0.5">1</span>
                                    <span className="text-lg font-bold tracking-tight text-gray-900">
                                        <span className="gradient-text">Call</span>
                                    </span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500">
                                © {new Date().getFullYear()} 1Call. {t.footer.rights} {t.footer.madeWith}
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
