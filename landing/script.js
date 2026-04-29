const translations = {
    uz: {
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
        welcome: {
            brand: '1Call',
            active: "Faol qo'ng'iroqlar",
            online: 'Onlayn operatorlar',
            avgWait: "O'rt. kutish",
            today: 'Bugun',
        },
    },
    ru: {
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
        welcome: {
            brand: '1Call',
            active: 'Активные звонки',
            online: 'Онлайн операторов',
            avgWait: 'Ср. ожидание',
            today: 'Сегодня',
        },
    },
    en: {
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
        welcome: {
            brand: '1Call',
            active: 'Active Calls',
            online: 'Online Operators',
            avgWait: 'Avg. Wait',
            today: 'Today',
        },
    },
};

const langLabels = {
    uz: { label: "O'zbekcha", flag: '🇺🇿' },
    ru: { label: 'Русский', flag: '🇷🇺' },
    en: { label: 'English', flag: '🇬🇧' },
};

const featureIcons = ['zap', 'phone-call', 'mic', 'bar-chart-3', 'globe', 'shield'];

let currentLang = localStorage.getItem('welcome_lang') || 'uz';

function updateContent() {
    const t = translations[currentLang];
    
    // Update simple text nodes
    document.getElementById('hero-badge').textContent = t.hero.badge;
    document.getElementById('hero-title-main').textContent = t.hero.title;
    document.getElementById('hero-title-highlight').textContent = t.hero.titleHighlight;
    document.getElementById('hero-subtitle').textContent = t.hero.subtitle;
    document.getElementById('hero-cta-text').textContent = t.hero.cta;
    document.getElementById('hero-cta-secondary').textContent = t.hero.ctaSecondary;
    document.getElementById('features-subtitle').textContent = t.features.subtitle;

    // Update data-t elements
    document.querySelectorAll('[data-t]').forEach(el => {
        const key = el.getAttribute('data-t');
        const keys = key.split('.');
        let val = t;
        keys.forEach(k => val = val[k]);
        el.textContent = val;
    });

    // Update Features
    const featuresList = document.getElementById('features-list');
    featuresList.innerHTML = '';
    t.features.items.forEach((item, i) => {
        const card = document.createElement('div');
        card.className = 'feature-card';
        card.innerHTML = `
            <div class="feature-icon">
                <i data-lucide="${featureIcons[i]}"></i>
            </div>
            <h3 class="feature-title">${item.title}</h3>
            <p class="feature-desc">${item.desc}</p>
        `;
        featuresList.appendChild(card);
    });

    // Footer
    const year = new Date().getFullYear();
    document.getElementById('footer-copyright').innerHTML = `© ${year} 1Call. ${t.footer.rights} ${t.footer.madeWith}`;

    // Update Nav
    document.getElementById('current-lang-flag').textContent = langLabels[currentLang].flag;
    document.getElementById('current-lang-label').textContent = langLabels[currentLang].label;

    // Re-initialize icons
    if (window.lucide) {
        lucide.createIcons();
    }
}

function initLangSwitcher() {
    const btn = document.getElementById('lang-btn');
    const menu = document.getElementById('lang-menu');
    
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('hidden');
        btn.classList.toggle('active');
    });

    document.addEventListener('click', () => {
        menu.classList.add('hidden');
        btn.classList.remove('active');
    });

    Object.keys(langLabels).forEach(code => {
        const option = document.createElement('button');
        option.className = `lang-option ${currentLang === code ? 'active' : ''}`;
        option.innerHTML = `
            <span class="flag">${langLabels[code].flag}</span>
            <span class="label">${langLabels[code].label}</span>
            ${currentLang === code ? '<i data-lucide="check-circle-2" class="check"></i>' : ''}
        `;
        option.addEventListener('click', () => {
            currentLang = code;
            localStorage.setItem('welcome_lang', code);
            updateContent();
            // Re-render menu to update active state
            renderLangMenu();
        });
        menu.appendChild(option);
    });

    function renderLangMenu() {
        menu.innerHTML = '';
        Object.keys(langLabels).forEach(code => {
            const option = document.createElement('button');
            option.className = `lang-option ${currentLang === code ? 'active' : ''}`;
            option.innerHTML = `
                <span class="flag">${langLabels[code].flag}</span>
                <span class="label">${langLabels[code].label}</span>
                ${currentLang === code ? '<i data-lucide="check-circle-2" class="check"></i>' : ''}
            `;
            option.addEventListener('click', () => {
                currentLang = code;
                localStorage.setItem('welcome_lang', code);
                updateContent();
                renderLangMenu();
            });
            menu.appendChild(option);
        });
        if (window.lucide) lucide.createIcons();
    }
}

function initParticles(containerId, count = 20) {
    const container = document.getElementById(containerId);
    if (!container) return;

    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 6 + 2;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.left = `${Math.random() * 100}%`;
        p.style.top = `${Math.random() * 100}%`;
        p.style.background = `hsl(${210 + Math.random() * 60}, 80%, 70%)`;
        p.style.setProperty('--duration', `${6 + Math.random() * 8}s`);
        p.style.setProperty('--delay', `${Math.random() * 5}s`);
        container.appendChild(p);
    }
}

function initCounters() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                animateValue(entry.target, 0, target, 2000);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.counter').forEach(el => observer.observe(el));
}

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        obj.innerHTML = Math.floor(eased * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function initNav() {
    const nav = document.getElementById('main-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
}

function scrollToFeatures() {
    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', () => {
    updateContent();
    initLangSwitcher();
    initParticles('particles-container', 20);
    initParticles('cta-particles', 15);
    initCounters();
    initNav();
});
