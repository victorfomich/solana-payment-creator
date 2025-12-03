#!/bin/bash

# Скрипт для установки зависимостей с обходом проблемы с npm cache

echo "Установка зависимостей..."

# Попытка установить с альтернативным кэшем
npm install --cache /tmp/.npm-cache || {
    echo "Попытка установки с альтернативным кэшем не удалась."
    echo ""
    echo "Попробуйте выполнить вручную:"
    echo "  sudo chown -R 501:20 ~/.npm"
    echo "  npm install"
    echo ""
    echo "Или используйте альтернативный кэш:"
    echo "  npm install --cache /tmp/.npm-cache"
    exit 1
}

echo "✅ Зависимости установлены!"
echo ""
echo "Запуск проекта:"
echo "  npm start"
echo ""
echo "Откройте: http://localhost:3000"

