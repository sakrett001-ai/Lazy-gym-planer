# Проба кожи (шаг 0): Anny против манекена

Разовая проба для плана «анатомия до идеала»: подходит ли параметрическая модель тела **Anny** как форма кожи
в покое и что получится, если вписать в неё наш скелет — нынешний (4.61.0) и с осанкой из ветки
`feat/anatomy-posture` (9f13c1f). Код приложения проба не меняет; сам Anny в репозиторий не кладётся.

## Что нужно

- Python 3.10+, `torch` (CPU), `anny` 0.6.1, `trimesh`, `rtree`, `scipy`, `roma`, `safetensors`, `pyyaml`, `pillow`;
- Node и зависимости репозитория (`npm ci`), Chromium для Playwright.

```
pip install --break-system-packages torch roma safetensors trimesh pyyaml pillow requests rtree scipy
pip download --no-deps anny==0.6.1 && pip install --break-system-packages --no-deps anny-0.6.1-py3-none-any.whl
```

Колесо `anny` (47 МБ, PyPI) уже содержит все нужные ассеты: базовую сетку и формы MakeHuman (`anny/data/mpfb2`),
риг (`mpfb2/rigs/standard`), кэш форм (`data/cached/anny.pth`). Скачивать с хостов NAVER ничего не нужно: оттуда
грузится только топология SMPL-X (некоммерческая лицензия) — проба её не использует. Индекс `download.pytorch.org`
в этой среде закрыт, поэтому `torch` ставится с PyPI (сборка с CUDA, работает и на процессоре).

## Как запускать

`W` — папка для промежуточных файлов (вне git), `POST` — временная копия ветки осанки:

```
git worktree add --detach $POST 9f13c1f && ln -s $PWD/node_modules $POST/node_modules
node tools/skin-probe/mannequin.js export --root . --out $W/m461.json        # скелет 4.61.0, суставы, anthro.js
node tools/skin-probe/mannequin.js export --root $POST --out $W/mpost.json   # то же для ветки осанки
python3 tools/skin-probe/anny_fit.py --mannequin $W/m461.json --out $W/fit.json --iters 15
python3 tools/skin-probe/register.py --fit $W/fit.json --skeleton $W/m461.json --root . --label 4.61.0 --out $W/reg-461.json
python3 tools/skin-probe/register.py --fit $W/fit.json --skeleton $W/mpost.json --root $POST --label posture --out $W/reg-post.json
python3 tools/skin-probe/sheet.py --work $W --out $W/contact-sheet.png
```

Кэш Anny — `ANNY_CACHE_DIR` (первый запуск собирает формы ≈ 1 мин).

## Файлы

| Файл | Что делает |
|---|---|
| `mannequin.js` | Выгрузка манекена копии репозитория (нейтральная стойка, кости в мировых см, замеры `anthro.js`) и запросы к его коже (знаковое расстояние, лучи) — те же формы, что у валидатора и `tools/skeleton/fit.js`. |
| `anny_body.py` | Anny в координатах манекена (см, Y вверх, +Z вперёд, +X влево); перевод в нейтральную стойку манекена её же ригом. |
| `anny_measure.py` | Замеры ANSUR II на сетке Anny по уровням и правилам `anthro.js`. |
| `anny_fit.py` | Подгонка фенотипа и местных форм Anny под медианы `anthro-ansur2.json` (Гаусс — Ньютон, конечные разности). |
| `landmarks.py` | Костные ориентиры на сетках MyoSim и нормы толщины мягких тканей с источниками. |
| `register.py` | Вписывание скелета в Anny по ориентирам (целиком и по сегментам), толщина тканей, выход костей, место для мышц спины, лопатка, рёбра, грудина, рельеф — для Anny и для кожи манекена той же копии. |
| `render-entry.mjs`, `render.mjs` | Кадры в студии объёмной сцены приложения (`src/volume/scene.mjs`: свет, тон, материал кожи) и сборка листа с таблицами. |
| `sheet.py` | Лист: ряды «манекен», «Anny», «скелет 4.61.0 в Anny», «скелет с осанкой в Anny» и таблицы. |

## Лицензии

- **Код Anny** — Apache License 2.0, «Copyright (C) 2025 NAVER Corporation» (файл `LICENSE` колеса
  `anny-0.6.1.dist-info/licenses/LICENSE`; заголовок каждого `.py`: «Anny, Copyright (C) 2025 NAVER Corp., Apache License,
  Version 2.0»). Файла NOTICE нет. Разрешает коммерческое и бесплатное использование, изменение и распространение;
  условия — копия лицензии, сохранение авторских пометок, отметка об изменениях. Не share-alike.
- **Сетка, формы (блендшейпы), риг и веса скиннинга** — `anny/data/mpfb2` (базовая сетка `3dobjs/base.obj`, формы
  `targets/**`, риг `rigs/standard/rig.default.json`, веса `weights.default.json`): ассеты MakeHuman из MPFB2, **CC0 1.0
  Universal** (`anny/data/mpfb2/LICENSE.md` — полный текст CC0; README Anny: «Anny relies on MakeHuman assets adapted from
  MPFB2 that are licensed under the CC0 1.0 Universal License»). Никаких условий, в том числе без указания авторства.
- Правки топологии Anny («minor nudity-related mesh edits», удаление висячих вершин, триангуляция) и кэш форм
  `data/cached/anny.pth` — часть пакета NAVER, то есть под Apache 2.0.
- Не нужны пробе и приложению: `data/faceunits01` (мимика, CC0), `data/soma` (топология SOMA-X, Apache 2.0),
  топологии `smplx`/`smpl` — **некоммерческие**, скачиваются по требованию с `download.europe.naverlabs.com`
  (`anny/paths.py`, `download_noncommercial_data`): их не трогать.
- Для бесплатного публичного веб-приложения: сетку и формы (CC0) можно встраивать как данные; если в приложение попадут
  данные, полученные кодом Anny (подогнанная сетка в нашей топологии), — положить в `third_party/anny` копию лицензии
  Apache 2.0 и строку об источнике, как сейчас у MyoSim. Share-alike нигде нет.

Скелет — MyoSim (Apache 2.0, `third_party/myosim`), замеры людей — ANSUR II (данные правительства США).
