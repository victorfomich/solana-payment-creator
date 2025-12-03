# Инструкция: Загрузка на GitHub и деплой на Vercel

## Шаг 1: Создайте репозиторий на GitHub

1. Зайдите на [github.com](https://github.com)
2. Нажмите кнопку **"+"** в правом верхнем углу → **"New repository"**
3. Заполните:
   - **Repository name:** `solana-payment-creator` (или любое другое имя)
   - **Description:** "Solana Pay payment request creator"
   - **Visibility:** Public или Private (на ваш выбор)
   - **НЕ** ставьте галочки на "Initialize with README", "Add .gitignore", "Choose a license"
4. Нажмите **"Create repository"**

## Шаг 2: Подключите локальный репозиторий к GitHub

Выполните в терминале (замените `YOUR_USERNAME` на ваш GitHub username):

```bash
cd "/Users/victor/Desktop/Transaction Creator Solana"

# Добавьте remote (замените YOUR_USERNAME на ваш GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/solana-payment-creator.git

# Загрузите код на GitHub
git branch -M main
git push -u origin main
```

**Или если используете SSH:**
```bash
git remote add origin git@github.com:YOUR_USERNAME/solana-payment-creator.git
git branch -M main
git push -u origin main
```

## Шаг 3: Подключите проект к Vercel через GitHub

### Вариант A: Через веб-интерфейс Vercel (рекомендуется)

1. Зайдите на [vercel.com](https://vercel.com)
2. Нажмите **"Add New Project"**
3. Выберите **"Import Git Repository"**
4. Найдите ваш репозиторий `solana-payment-creator` и нажмите **"Import"**
5. Настройки проекта:
   - **Framework Preset:** Other
   - **Root Directory:** `./` (оставьте как есть)
   - **Build Command:** (оставьте пустым)
   - **Output Directory:** (оставьте пустым)
   - **Install Command:** `npm install`
6. Нажмите **"Deploy"**

Готово! Vercel автоматически задеплоит проект и даст вам URL.

### Вариант B: Через Vercel CLI

```bash
# Установите Vercel CLI (если ещё не установлен)
npm install -g vercel

# Войдите в Vercel
vercel login

# Подключите проект к GitHub репозиторию
cd "/Users/victor/Desktop/Transaction Creator Solana"
vercel --prod
```

## Шаг 4: Настройте Environment Variables на Vercel

1. Зайдите в ваш проект на Vercel Dashboard
2. Перейдите в **Settings** → **Environment Variables**
3. Добавьте переменные:
   - **Key:** `SOLANA_CLUSTER`
   - **Value:** `testnet`
   - Нажмите **"Save"**
4. (Опционально) Если нужен кастомный RPC:
   - **Key:** `SOLANA_RPC_URL`
   - **Value:** `https://api.testnet.solana.com`

## Шаг 5: Автоматические деплои

Теперь каждый раз когда вы делаете `git push` на GitHub, Vercel автоматически задеплоит новую версию!

```bash
# Внесли изменения
git add .
git commit -m "Update"
git push

# Vercel автоматически задеплоит новую версию!
```

## Проверка работы

После деплоя откройте ваш URL (например: `https://solana-payment-creator.vercel.app`) и проверьте:

1. ✅ Открывается главная страница
2. ✅ Можно ввести адрес и сумму
3. ✅ Генерируется QR код и ссылка
4. ✅ API работает: `https://your-project.vercel.app/api/health`

## Полезные ссылки

- **GitHub:** https://github.com/YOUR_USERNAME/solana-payment-creator
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Ваш сайт:** https://your-project.vercel.app

---

**Готово! Теперь у вас есть публичный сайт для приёма платежей Solana! 🎉**

