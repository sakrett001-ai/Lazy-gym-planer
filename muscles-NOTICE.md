# Мышцы манекена: MyoSim и DAS3

`src/data/muscles.bin` — производные данные: пути мышц (точки начала, промежуточные точки, прикрепления и огибающие
тела), пересчитанные в рамки костей скелета манекена Lazy Gym Planner, и объёмы мышц с длинами сухожилий
(`tools/muscles/`).

## MyoSim — ноги, таз, туловище, рука

Библиотека моделей **MyoSim** (MyoHub, https://github.com/MyoHub/myo_sim, коммит 93b0ca8, лицензия Apache 2.0 —
`third_party/myosim/LICENSE`, в сборке `skeleton-LICENSE.txt`). Взяты 390 мышц сборки myofullbody: ноги — Rajagopal
и др., 2016; рука — Holzbaur и др., 2005 (MoBL); поясница и живот — MyoBack, Walia и др., IROS 2025 (по модели
Constrained Lumbar Spine, SimTK lumbarspine). Не взяты внутренние мышцы кисти и левая рука модели (левая получена
зеркально из правой, как кости).

## DAS3 — мышцы лопатки

Модель плеча **DAS3** (Dynamic Arm Simulator, https://github.com/dasproject/DAS3, коммит d6f2ff0, лицензия Apache 2.0 —
`LICENSE` рядом, в сборке `muscles-DAS3-LICENSE.txt`):
Chadwick E. K., Blana D., Kirsch R. F., van den Bogert A. J. Real-time simulation of three-dimensional shoulder girdle
and arm dynamics. IEEE Transactions on Biomedical Engineering, 2014, 61(7): 1947–1956. doi:10.1109/TBME.2014.2309727
(прикрепления мышц — по препаратам Klein Breteler и др., 1999).

Взяты 37 мышц между грудной клеткой и лопаткой (правая сторона; левая — зеркально): трапециевидная (13 пучков),
ромбовидные (5), поднимающая лопатку (2), малая грудная (4), передняя зубчатая (12) с огибающим эллипсоидом.

Изменения: кости DAS3 совмещены с костями манекена по поверхности (ICP: грудная клетка — аффинно, остальные — подобием),
точки прикрепления перенесены этими преобразованиями; точки, оказавшиеся дальше 1 см от поверхности своей кости
(у DAS3 начала на остистых отростках лежат в 3–4,4 см позади позвонков её же сетки), поставлены на поверхность кости;
начало верхних пучков трапециевидной и поднимающей лопатку отнесены к черепу и шейному отделу по анатомии.
Эллипсоид огибается приближённо — как единичная сфера в своих осях.

## Объём мышц

Объём каждой мышцы — из опубликованной таблицы МРТ (средние у 49 мужчин), пересчитанный на рост и массу манекена:
Riem L., Pinette M., DuCharme O. и др., Blemker S. S. Big bones mean big muscles: an MRI-based dataset of
muscle-bone-body size relationships across 70 human muscles of the upper limb, trunk, and lower limb. Journal of Applied
Physiology, 2026, 140: 1–19. doi:10.1152/japplphysiol.00772.2025 (таблица 3).

Доли длины мышц ног — по препаратам: Ward S. R., Eng C. M., Smallwood L. H., Lieber R. L. Are current measurements of
lower extremity muscle architecture accurate? Clinical Orthopaedics and Related Research, 2009, 467: 1074–1082.
doi:10.1007/s11999-008-0594-8 (таблица 3).

Деление объёма между пучками одной мышцы — по числовым параметрам исходных моделей OpenSim (сила, длина волокон;
файлы моделей не входят ни в репозиторий, ни в сборку, параметры — `tools/muscles/fixtures/params.json`):
- ноги — Rajagopal и др., 2016 (выше), файл Models/Rajagopal/Rajagopal2016.osim из opensim-org/opensim-models,
  коммит d9b05d4 (исходное распространение — https://simtk.org/projects/full_body);
- рука — MoBL-ARMS: Holzbaur и др., 2005; Saul K. R., Hu X., Goehler C. M. и др. Benchmarking of dynamic simulation
  predictions in two software platforms using an upper limb musculoskeletal model. Computer Methods in Biomechanics and
  Biomedical Engineering, 2015, 18(13): 1445–1458. doi:10.1080/10255842.2014.916698 — копия MoBL_ARMS_J.osim из
  stanfordnmbl/osim-rl (коммит 610b95c, лицензия MIT);
- плечевой пояс — DAS3 (выше).
