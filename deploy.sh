#!/usr/bin/env sh
# Сборка и публикация на GitHub Pages: ветка gh-pages = содержимое dist/
# Использование: ./deploy.sh   (или npm run deploy)
set -e
cd "$(dirname "$0")"
node build.js
REMOTE="$(git remote get-url origin)"
MSG="Сборка $(node -p "require('./package.json').version") для GitHub Pages"
cd dist
touch .nojekyll
rm -rf .git
git init -q -b gh-pages
git add -A
git -c user.name="podhod-deploy" -c user.email="deploy@podhod" commit -q -m "$MSG"
git push -f "$REMOTE" gh-pages:gh-pages
rm -rf .git
echo "Опубликовано: https://sakrett001-ai.github.io/Lazy-gym-planer/"
