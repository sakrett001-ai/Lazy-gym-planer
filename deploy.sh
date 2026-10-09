#!/usr/bin/env sh
# Сборка и публикация на GitHub Pages с сохранением отдельных тестовых версий.
# Использование: ./deploy.sh; после проверенной сборки: ./deploy.sh --no-build
set -e
cd "$(dirname "$0")"
# Атлас не публикуется, если хоть одно упражнение нарушает биомеханику или проходит сквозь инвентарь.
if ! node tools/mannequin/check.js --quiet; then
  echo "Проверка манекена не пройдена — публикация отменена (см. AGENTS.md)." >&2
  exit 1
fi
case "${1-}" in
  '') node build.js ;;
  --no-build) ;;
  *) echo "Использование: $0 [--no-build]" >&2; exit 2 ;;
esac
source_dir=$(pwd)
if [ ! -f dist/index.html ] || [ ! -f dist/sw.js ] || [ -e dist/.git ]; then
  echo "Нет корректной сборки dist/ (index.html, sw.js; без .git)." >&2
  exit 1
fi
deploy_remote=$(git remote get-url origin)
deploy_message="Сборка $(node -p "require('./package.json').version") для GitHub Pages"
deploy_tmp=$(mktemp -d "${TMPDIR:-/tmp}/lazy-gym-deploy.XXXXXX")
trap 'rm -rf "$deploy_tmp"' 0
trap 'exit 1' HUP INT TERM

# Начинаем с опубликованной ветки: её история, atlas-preview/, motion-lab/
# и прочие самостоятельные страницы остаются на месте.
git clone --quiet --no-tags --single-branch --branch gh-pages "$deploy_remote" "$deploy_tmp/site"
cp -R "$source_dir/dist/." "$deploy_tmp/site/"
cd "$deploy_tmp/site"
touch .nojekyll
git add -A
if git diff --cached --quiet; then
  echo "Сборка уже опубликована; изменений нет."
  exit 0
fi
git -c user.name="podhod-deploy" -c user.email="deploy@podhod" commit -q -m "$deploy_message"
# Обычный fast-forward push отклоняет конкурентную публикацию.
git push origin HEAD:refs/heads/gh-pages
echo "Опубликовано: https://sakrett001-ai.github.io/Lazy-gym-planer/"
