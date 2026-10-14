# Мышцы манекена: MyoSim, DAS3 и Gait2392

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
поставлены на поверхность кости. Начала на позвоночнике (трапециевидная, ромбовидные, поднимающая лопатку) с версии
4.34.0 переносятся по уровню позвонка: выйная связка, вершины остистых отростков, поперечные отростки; по анатомии
(Gray's Anatomy) трапециевидная продлена до T12, ромбовидные посажены на C7–T5, поднимающая лопатку — на C1 и C4.
Эллипсоид огибается приближённо — как единичная сфера в своих осях.

## Gait2392 — гребенчатая мышца

Модель нижней конечности **Gait2392** (Models/Gait2392_Simbody из https://github.com/opensim-org/opensim-models,
коммит d9b05d4): Delp S. L., Loan J. P., Hoy M. G., Zajac F. E., Topp E. L., Rosen J. M. An interactive graphics-based
model of the lower extremity to study orthopaedic surgical procedures. IEEE Transactions on Biomedical Engineering, 1990,
37: 757–767; модель — D. G. Thelen, A. Seth, F. C. Anderson, S. L. Delp. Лицензия Creative Commons Attribution 3.0
(https://creativecommons.org/licenses/by/3.0/). Взята одна мышца — гребенчатая (pect_r; левая — зеркально).
Изменения: таз и бедро Gait2392 совмещены с костями манекена по поверхности (ICP, подобие; невязка 2–3 мм), точки пути
перенесены этим преобразованием; объём — по МРТ (ниже).

## Части мышц по анатомии

Части, которых нет в исходных моделях, построены на костях манекена по описаниям прикреплений (Gray's Anatomy):
поясничная и подвздошные части широчайшей (4.32.0), верхние зубцы наружной косой (4.34.0), грудино-ключично-
сосцевидная, ременные мышцы головы и шеи, лестничные, остистая мышца груди (4.35.0) — `tools/muscles/anatomy.js`.

Межрёберные мышцы (4.40.0) — пласты между рёбрами сетки грудной клетки скелета (MyoSim, выше), по описанию Gray's Anatomy
(1918, с. 403) — `tools/muscles/intercostals.js`; чужих моделей и сеток не берётся. Толщина — по опубликованным
измерениям: УЗИ 12 здоровых мужчин — Yoshida R., Tomita K., Kawamura K., Nozaki T. и др. Measurement of intercostal
muscle thickness with ultrasound imaging during maximal breathing. Journal of Physical Therapy Science, 2019, 31(4):
340–343. doi:10.1589/jpts.31.340 (таблица 2); деление между наружным и внутренним слоями — по массам у препаратов:
Wilson T. A., Legrand A., Gevenois P. A., De Troyer A. Respiratory effects of the external and internal intercostal
muscles in humans. Journal of Physiology, 2001, 530(Pt 2): 319–330. doi:10.1111/j.1469-7793.2001.0319l.x (PMC2278403).

## Объём мышц

Объём каждой мышцы — из опубликованной таблицы МРТ (средние у 49 мужчин), пересчитанный на рост и массу манекена:
Riem L., Pinette M., DuCharme O. и др., Blemker S. S. Big bones mean big muscles: an MRI-based dataset of
muscle-bone-body size relationships across 70 human muscles of the upper limb, trunk, and lower limb. Journal of Applied
Physiology, 2026, 140: 1–19. doi:10.1152/japplphysiol.00772.2025 (таблица 3).

Доли длины мышц ног — по препаратам: Ward S. R., Eng C. M., Smallwood L. H., Lieber R. L. Are current measurements of
lower extremity muscle architecture accurate? Clinical Orthopaedics and Related Research, 2009, 467: 1074–1082.
doi:10.1007/s11999-008-0594-8 (таблица 3).

Мышцы шеи (в наборе выше их нет) — МРТ мужчин: Zheng L., Siegmund G., Ozyigit G., Vasavada A. Sex-specific prediction
of neck muscle volumes. Journal of Biomechanics, 2013, 46(5): 899–904 (PMC3648672), таблицы 1–3; между частями мышцы —
по массам у Borst J. Muscle parameters for musculoskeletal modelling of the human neck. MSc thesis, TU Delft, 2009
(опубликовано: Borst J., Forbes P. A., Happee R., Veeger D. Clinical Biomechanics, 2011). Доля остистой мышцы в объёме
выпрямителя позвоночника — по поперечнику и длине волокон: Delp S. L., Suryanarayanan S., Murray W. M., Uhlir J.,
Triolo R. J. Architecture of the rectus abdominis, quadratus lumborum, and erector spinae. Journal of Biomechanics, 2001,
34: 371–375.

Деление объёма между пучками одной мышцы — по числовым параметрам исходных моделей OpenSim (сила, длина волокон;
файлы моделей не входят ни в репозиторий, ни в сборку, параметры — `tools/muscles/fixtures/params.json`):
- ноги — Rajagopal и др., 2016 (выше), файл Models/Rajagopal/Rajagopal2016.osim из opensim-org/opensim-models,
  коммит d9b05d4 (исходное распространение — https://simtk.org/projects/full_body);
- рука — MoBL-ARMS: Holzbaur и др., 2005; Saul K. R., Hu X., Goehler C. M. и др. Benchmarking of dynamic simulation
  predictions in two software platforms using an upper limb musculoskeletal model. Computer Methods in Biomechanics and
  Biomedical Engineering, 2015, 18(13): 1445–1458. doi:10.1080/10255842.2014.916698 — копия MoBL_ARMS_J.osim из
  stanfordnmbl/osim-rl (коммит 610b95c, лицензия MIT);
- плечевой пояс — DAS3 (выше).

Где модели расходятся с измерениями нескольких препаратов, доли частей — по препаратам (с 4.36.0): дельтовидная —
Gómez M., Casado A., de Diego M., Pastor J. F., Potau J. M. American Journal of Primatology, 2022, 84(7): e23390.
doi:10.1002/ajp.23390; двуглавая плеча — Murray W. M., Buchanan T. S., Delp S. L. The isometric functional capacity of
muscles that cross the elbow. Journal of Biomechanics, 2000, 33: 943–952. Задняя часть дельтовидной построена тремя
линиями вдоль ости лопатки (путь к плечу — как в MoBL-ARMS).
