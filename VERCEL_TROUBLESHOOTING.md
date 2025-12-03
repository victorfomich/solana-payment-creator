# Решение проблем с автоматическим деплоем Vercel

## Проблема: Vercel не обновляется после изменений на GitHub

### Решение 1: Проверьте подключение репозитория

1. Зайдите на [vercel.com/dashboard](https://vercel.com/dashboard)
2. Откройте ваш проект
3. Перейдите в **Settings** → **Git**
4. Убедитесь что:
   - ✅ Репозиторий подключен правильно
   - ✅ Видны последние коммиты
   - ✅ Production Branch = `main` (или `master`)

### Решение 2: Переподключите репозиторий

Если репозиторий не подключен или подключен неправильно:

1. **Settings** → **Git** → **Disconnect Repository**
2. Затем **Connect Git Repository** → выберите ваш репозиторий
3. Нажмите **Deploy**

### Решение 3: Запустите деплой вручную

#### Через веб-интерфейс:
1. Зайдите в ваш проект на Vercel
2. Откройте вкладку **Deployments**
3. Найдите последний деплой
4. Нажмите **"..."** (три точки) → **Redeploy**

#### Через Vercel CLI:
```bash
# Установите Vercel CLI (если ещё не установлен)
npm install -g vercel

# Войдите
vercel login

# Запустите деплой вручную
cd "/Users/victor/Desktop/Transaction Creator Solana"
vercel --prod
```

### Решение 4: Проверьте webhooks GitHub

1. Зайдите на GitHub → ваш репозиторий
2. **Settings** → **Webhooks**
3. Найдите webhook от Vercel (должен быть URL вида `https://api.vercel.com/v1/integrations/github/...`)
4. Проверьте:
   - ✅ Status: Active (зелёная галочка)
   - ✅ Recent Deliveries: должны быть успешные запросы (зелёные)

Если webhook не работает:
- Удалите его и переподключите репозиторий в Vercel (см. Решение 2)

### Решение 5: Проверьте логи деплоя

1. В Vercel Dashboard → ваш проект → **Deployments**
2. Откройте последний деплой
3. Посмотрите **Build Logs** и **Function Logs**
4. Если есть ошибки — исправьте их

### Решение 6: Принудительный деплой через GitHub

Создайте пустой коммит чтобы запустить деплой:

```bash
cd "/Users/victor/Desktop/Transaction Creator Solana"
git commit --allow-empty -m "Trigger Vercel deployment"
git push
```

### Решение 7: Проверьте настройки проекта

В Vercel Dashboard → **Settings** → **General**:

- ✅ **Build Command:** (должно быть пусто или `npm install`)
- ✅ **Output Directory:** (должно быть пусто)
- ✅ **Install Command:** `npm install`
- ✅ **Root Directory:** `./`

### Решение 8: Проверьте что изменения действительно на GitHub

```bash
# Проверьте что изменения запушены
cd "/Users/victor/Desktop/Transaction Creator Solana"
git log --oneline -5

# Проверьте что вы на правильной ветке
git branch

# Если нужно, запушьте изменения
git push origin main
```

## Быстрая проверка

Выполните эти команды по порядку:

```bash
# 1. Убедитесь что изменения на GitHub
cd "/Users/victor/Desktop/Transaction Creator Solana"
git status
git log --oneline -3

# 2. Если есть локальные изменения - запушьте их
git add .
git commit -m "Update"
git push

# 3. Запустите деплой вручную через CLI
vercel --prod
```

## Автоматический деплой должен работать так:

1. Вы делаете `git push` на GitHub
2. GitHub отправляет webhook в Vercel
3. Vercel автоматически запускает деплой
4. Через 1-2 минуты сайт обновляется

Если это не работает — используйте Решение 3 (ручной деплой) или Решение 2 (переподключение).

## Проверка что деплой работает

После деплоя проверьте:
- Откройте ваш Vercel URL
- Посмотрите на изменения (например, текст на странице)
- Если изменения есть — деплой работает!

## Полезные ссылки

- **Vercel Dashboard:** https://vercel.com/dashboard
- **GitHub репозиторий:** https://github.com/victorfomich/solana-payment-creator
- **Vercel Docs:** https://vercel.com/docs

