<div align="center">
  <img src="https://raw.githubusercontent.com/IslamAbdurahman/1call/main/public/favicon.ico" alt="1Call Logo" width="100" />

  # 🚀 1Call — Premium Call Center Tizimi

  **1Call** — zamonaviy, tezkor va yuqori ishonchlilikka ega yangi avlod qo'ng'iroqlarni markazlashtirilgan holda boshqarish (Call Center) tizimi. <br> Asterisk PBX va so'nggi veb texnologiyalar yordamida korxonangiz aloqa markazini to'liq avtomatlashtiring.

  [![Laravel 12](https://img.shields.io/badge/Laravel-12.0-FF2D20?style=for-the-badge&logo=laravel)](https://laravel.com)
  [![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
  [![Inertia.js](https://img.shields.io/badge/Inertia.js-v2-9553E9?style=for-the-badge&logo=inertia)](https://inertiajs.com)
  [![Asterisk 23](https://img.shields.io/badge/Asterisk-23-F36E21?style=for-the-badge&logo=asterisk)](https://asterisk.org)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql)](https://postgresql.org)
  [![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_4-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
</div>

---

## ✨ Asosiy Imkoniyatlar

1Call yordamida qo'ng'iroqlarni qabul qilish va ularni tahlil qilish jarayoni hech qachon bunchalik oson bo'lmagan:

* 📊 **Smart Dashboard** — barcha qo'ng'iroqlar statistikasi, faol operatorlar va navbatlarni real vaqt rejimida (Real-time) kuzatish imkoniyati.
* 📞 **SIP Raqamlar (SIP Numbers)** — PJSIP orqali cheksiz SIP raqamlarni biriktirish, ularni guruhlar va operatorlarga taqsimlash.
* 👥 **Operatorlar (Agents & Operators)** — jamoa a'zolarini qo'shish, ularning ruxsatlarini boshqarish va unumdorligini tahlil qilish.
* 🏢 **Guruhlar va Navbatlar (Queues & Groups)** — kiruvchi qo'ng'iroqlarni to'g'ri bo'limlarga yo'naltirish (masalan: Sotuv, Texnik yordam) va navbatni boshqarish.
* 📇 **Kontaktlar (CRM & Contacts)** — mijozlar bazasi, ularning ma'lumotlari haqida tezkor axborot va integratsiyalashgan manbalar.
* 🗂 **Qo'ng'iroqlar Tarixi (Call Histories)** — har bir suhbatni chuqur tahlil qilish, **audio yozuvlarni to'g'ridan-to'g'ri tizim orqali tinglash**.
* 🌐 **Ko'p tillilik (i18n)** — tizim erkin tarzda 🇺🇿 O'zbek, 🇷🇺 Rus va 🇬🇧 Ingliz tillarida ishlaydi.
* ⚡ **PWA Qo'llab-quvvatlash** — ilovani mobil va desktop qurilmalarga to'liq platforma sifatida o'rnatish.

---

## 🛠 Texnologiyalar Steki

Ushbu loyiha dasturlashdagi **eng so'nggi trendlar** va **mustahkam arxitektura** asosida qurilgan:

### ⚙️ Backend & Infratuzilma
- **[Laravel 12](https://laravel.com/)** — PHP 8.3 asosidagi kuchli va xavfsiz backend freymvork.
- **[Asterisk 23](https://www.asterisk.org/)** — Ishonchli va moslashuvchan PBX (Telefon stansiya).
- **PostgreSQL** — Ma'lumotlarni ishonchli saqlovchi va ODBC orqali Asterisk bilan to'g'ridan-to'g'ri (Realtime) ishlovchi ma'lumotlar bazasi.
- **Nginx** — Veb server, API va WebSocket proxy protokollari uchun maqbullashtirilgan.
- **Asterisk ARI** — WebSocket orqali Real-time aloqalar va kengaytirilgan boshqaruv.

### 🎨 Frontend & UI/UX
- **[React 19](https://react.dev/)** — Intuitiv, juda tezkor va modernfoydalanuvchi interfeysi.
- **[Inertia.js v2](https://inertiajs.com/)** — APIlarsiz to'liq SPA (Single Page Application) tajribasi.
- **[Tailwind CSS v4](https://tailwindcss.com/)** — Utility-first CSS orqali zamonaviy dizayn va moslashuvchanlik.
- **[Shadcn UI](https://ui.shadcn.com/)** (Radix UI) — Premium va qulay his baxsh etuvchi, ochiq kodli ajoyib komponentlar.

---

## 🚀 O'rnatish va Ishga tushirish

Loyihani serverga o'rnatish va to'liq sozlsh uchun mukammal bosqichma-bosqich qo'llanma tayyorlangan:

🔗 **[O'RNATISH QO'LLANMASI (SETUP.md)](./SETUP.md)**

Qo'llanma quyidagilarni o'z ichiga oladi:
1. `Nginx` va `PostgreSQL` o'rnatish.
2. `Asterisk 23` va `ODBC` drayverlarini kompilatsiya qilib o'rnatish.
3. PHP 8.3 va tegishli kutubxonalarni sozlash.
4. Muhitni (`.env`) tayyorlash, PJSIP/ARI konfiguratsiyalari.
5. Loyalty xizmatlarini (Background tasks) ishga tushirish.

---

## 🎨 Dizayn Falsafasi

1Call boshqa oddiy, zerikarli tizimlardan farqli o'laroq:
* 🌙 **Dark Mode (Tungi rejim)** va moslashtirilgan ranglar palitrasi ko'zni charchatmaydi.
* 📱 **To'liq Responsive** — har qanday ekranda mukammal ko'rinish.
* 🌀 **Mikro-animatsiyalar** — har bir klik va o'tishlarda yumshoq effektlar, Premium his-tuyg'u taqdim etadi.
* ⚡ **Tezlik** — Inertia v2 va React 19 Compiler orqali sahifalar orasida chaqmoq tezligida o'tish imkoniyati.

---

## 🤝 Hissa qo'shish (Contributing)

Siz ushbu ochiq kodli loyihaga o'z hissangizni qo'shishingiz mumkin:
1. Repozitoriyni `Fork` qiling.
2. O'zgartirishlaringizni yangi branchda (`git checkout -b feature/YangiImkoniyat`) bajaring.
3. Commit qiling (`git commit -m 'Yangi imkoniyat qo'shildi'`).
4. Branchga push qiling (`git push origin feature/YangiImkoniyat`).
5. `Pull Request` oching.

---

## 📄 Litsenziya

Ushbu loyiha [MIT Litsenziyasi](https://opensource.org/licenses/MIT) ostida ommaga taqdim etiladi. Tizimdan erkin foydalanishingiz, o'zgartirishingiz va tarqatishingiz mumkin.

<div align="center">
  <br>
  <i>Loyiha mehr, innovatsiya va mukammallikka intilish bilan "1Call" jamoasi tomonidan yaratilgan.</i> ✨
</div>
