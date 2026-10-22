"""Цели и нормы шага 1 (кожа Anny): телосложение по ANSUR II, мягкие ткани над костями, осанка, место для мышц.

Каждая норма — с источником (ключ в SOURCES). Где источник — наша же проверка (тесты мышц, 4.61.0), так и сказано.
"""

SOURCES = {
    'ANSUR': 'Gordon C. C. et al. 2012 Anthropometric Survey of U.S. Army Personnel (ANSUR II): Methods and Summary Statistics. '
             'NATICK/TR-15/007, 2014; квартили мужчин 170–180 см, 72–84 кг — tools/mannequin/anthro-ansur2.json',
    'S18': 'Störchle P. et al. Standardized ultrasound measurement of subcutaneous fat patterning. Sci Rep 2018; 8: 16268 '
           '(подкожный слой молодых мужчин 1,9–10,2 мм + кожа 1,5–2,5 мм)',
    'L21': 'Lemon et al., 2021 — КТ, мягкие ткани над грудиной у мужчин 1,8 ± 0,9 см (место введения внутрикостного катетера)',
    'S14': 'Seol S. J. et al. Ann Rehabil Med 2014; 38: 72–76 — УЗИ: от кожи до ромбовидной 14 ± 2 мм (ИМТ 23–25), 18 ± 3 мм (ИМТ ≥ 25)',
    'DG06': 'De Greef S. et al. Large-scale in-vivo Caucasian facial soft tissue thickness database. Forensic Sci Int 2006; 159S: S126–S146 (УЗИ, 967 взрослых)',
    'J17': 'Johari M., Esmaeili F., Hamidi H. Facial soft tissue thickness of midline in an Iranian sample: MRI study. '
           'Open Dent J 2017; 11: 375 (мужчины 25–45 лет: надпереносье 7,8, переносица 9,0, подбородок 15,2, под подбородком 9,0 мм)',
    'T12': 'Taki N. et al. CAOS 2012 (КТ, 22 сустава, ИМТ 24,7): над передней верхней остью 20,8 ± 12,2 мм (3–47,5)',
    'V05': 'Vialle R. et al. Radiographic analysis of the sagittal alignment and balance of the spine in asymptomatic subjects. '
           'J Bone Joint Surg Am 2005; 87: 260–267 (300 взрослых: PI 52,6 ± 10,4°, SS 41,2 ± 8,4°, PT 13,2 ± 6,1°, '
           'лордоз 60,2 ± 10,3°, кифоз 40,6 ± 10°)',
    'LH16': 'Le Huec J. C., Hasegawa K. Normative values for the spine shape parameters using 3D standing analysis from a database of '
            '268 asymptomatic Caucasian and Japanese subjects. Eur Spine J 2016; 25: 3630–3637 (PT = 0,44·PI − 11°, LL = 0,54·PI + 27,6°, '
            'TK(T1–T12) = 0,75·LL)',
    'S16': 'Sudhir G. et al. Radiographic analysis of the sacropelvic parameters of the spine and their correlation in normal asymptomatic '
           'subjects. Global Spine J 2016; 6: 169–175 (мужчины: LL L1–S1 47,1 ± 10,1°, TK T3–T12 31,2 ± 10,5°, PT 16,9 ± 6,6°, SS 36,1 ± 7,3°)',
    'K10': 'Knott P. T., Mardjetko S. M., Techy F. The use of the T1 sagittal angle in predicting overall sagittal balance of the spine. '
           'Spine J 2010; 10: 994–998 (T1 slope 25 ± 7°)',
    'C18': 'Columna 2018 (SciELO), 94 бессимптомных взрослых: C2–C7 лордоз 16,5 ± 10,8°, T1 slope 24,8 ± 7,0°, cSVA C2–C7 16,9 ± 10,6 мм',
    'H97': 'Hardacker J. W. et al. Radiographic standing cervical segmental alignment in adult volunteers without neck symptoms. '
           'Spine 1997; 22: 1472–1480 (лордоз C1–C7 40 ± 9,7°; C2 впереди C7)',
    'D15': 'Diebo B. G. et al. 2015 (SVA < 5 см — норма; цит. по сводке Columna 2018)',
    'K16': 'Keough N., Mirjalili S. A. et al. The thoracic surface anatomy of adult black South Africans: a reappraisal from CT scans. '
           'Clin Anat 2016; 29: 1018–1024 (лёжа: подрёберная плоскость — L1/L2; мечевидно-грудинное сочленение у мужчин — T10)',
    'M12': 'Mirjalili S. A. et al. A reappraisal of adult thoracic surface anatomy. Clin Anat 2012; 25: 827–834 (КТ 153 взрослых: '
           'уровни грудинного угла и мечевидно-грудинного сочленения — как в учебниках, T4–T5 и T9, с широкой вариацией)',
    'H87': 'Haller J. A. et al. Use of CT scans in selection of patients for pectus excavatum surgery. J Pediatr Surg 1987; 22: 904–906 '
           '(индекс Халлера у здоровых ≈ 2,5; > 3,25 — воронкообразная грудь)',
    'R26': 'Riem et al., 2026 (J Appl Physiol 140: 1–19) — объёмы мышц по МРТ 49 мужчин; на них — тесты столбов спины '
           '(tools/muscles.test.js: длиннейшая ≥ 0,8 МРТ, подвздошно-рёберная ≥ 0,85) и место в 4.61.0',
    'GR18': "Gray's Anatomy, 1918 — слои спины, уровни позвонков",
    'GS08': 'Grimmer-Somers K., Milanese S., Louw Q. 2008 — краниовертебральный угол (C7 — козелок к горизонтали) 48–50° и больше — '
            'норма, меньше 48° — голова вынесена вперёд (цит. по JCDR 2023)',
    'own': 'наша проверка (по анатомии слоёв), без отдельного числа из литературы',
}

# ---------------------------------------------------------------- телосложение
# «Подтянутое» в пределах ANSUR II: талия и ягодицы — к p25, грудь, плечи и обхваты рук — к p75; остальное — медиана.
# target: 'p25' | 'p50' | 'p75'; вес — важность в подгонке
ANSUR_TONED = {
    'stature': ('p50', 4), 'crotchheight': ('p50', 3),
    'chestcircumference': ('p75', 2), 'chestbreadth': ('p75', 1), 'chestdepth': ('p75', 1),
    'waistcircumference': ('p25', 2), 'waistbreadth': ('p25', 1), 'waistdepth': ('p25', 1.5),
    'buttockcircumference': ('p25', 2), 'buttockdepth': ('p25', 1.5), 'hipbreadth': ('p25', 1),
    'bideltoidbreadth': ('p75', 1.5), 'shouldercircumference': ('p75', 1),
    'bicepscircumferenceflexed': ('p75', 1), 'forearmcircumferenceflexed': ('p75', 1),
    'neckcircumference': ('p50', 1), 'neckcircumferencebase': ('p50', .5), 'wristcircumference': ('p50', 1),
    'thighcircumference': ('p50', 1), 'lowerthighcircumference': ('p50', 1), 'calfcircumference': ('p50', 1),
    'anklecircumference': ('p50', 1),
    'headcircumference': ('p50', 2), 'headlength': ('p50', 1.5), 'headbreadth': ('p50', 1.5),
    'footlength': ('p50', .7), 'footbreadthhorizontal': ('p50', .3),
    'weightkg': ('p50', .3),
}
TONED_NOTE = {'p25': 'к p25', 'p50': 'медиана', 'p75': 'к p75'}

# ---------------------------------------------------------------- мягкие ткани (кость → кожа), см
TISSUE = {
    'C7': (0.4, 1.2, 'S18'), **{'T%d' % i: (0.4, 1.5, 'S18') for i in range(1, 13)},
    'jugular': (0.5, 1.8, 'L21'), 'sternum': (0.9, 2.7, 'L21'),
    'acromion': (0.3, 1.0, 'S18'), 'clavicle': (0.3, 1.2, 'S18'),
    'scapSpine': (1.2, 2.1, 'S14'), 'supAngle': (1.4, 3.0, 'S14'), 'infAngle': (1.0, 2.5, 'own'),
    'iliacCrest': (0.5, 2.5, 'own'), 'ASIS': (0.6, 2.1, 'T12'), 'PSIS': (0.5, 2.0, 'own'), 'sacrum': (0.4, 1.5, 'own'),
    'trochanter': (1.5, 4.0, 'own'), 'patella': (0.3, 1.2, 'S18'), 'tibialCrest': (0.2, 0.9, 'S18'),
    'fibulaHead': (0.5, 1.5, 'own'), 'latMalleolus': (0.2, 0.9, 'S18'), 'medMalleolus': (0.2, 0.9, 'S18'),
    'olecranon': (0.3, 1.2, 'S18'), 'latEpicondyle': (0.3, 1.2, 'S18'), 'medEpicondyle': (0.3, 1.2, 'S18'),
    'radialStyloid': (0.2, 0.9, 'S18'), 'ulnarStyloid': (0.2, 0.9, 'S18'),
    # голова (по черепу MyoSim): лицо — De Greef 2006 (УЗИ) … Johari 2017 (МРТ); свод — кожа и апоневроз
    'vertex': (0.5, 0.9, 'own'), 'glabella': (0.45, 0.8, 'DG06'), 'nasion': (0.55, 0.9, 'J17'),
    'pogonion': (0.9, 1.5, 'J17'), 'menton': (0.6, 1.0, 'J17'), 'gonion': (0.9, 1.8, 'DG06'),
    'zygion': (0.5, 1.1, 'DG06'), 'opisthocranion': (0.5, 1.0, 'own'), 'euryon': (0.5, 1.4, 'own'),
}

# ---------------------------------------------------------------- осанка (норма: среднее, СКО, источник)
POSTURE = {
    'PI': (52.6, 10.4, 'V05'),          # морфологический, у таза MyoSim — свой (не подбирается)
    'PT': (13.2, 6.1, 'V05'), 'SS': (41.2, 8.4, 'V05'),
    'LL': (53.0, 10.0, 'LH16'),          # L1–S1; среднее — по PI таза MyoSim (0,54·PI + 27,6), разброс — V05
    'TK': (40.6, 10.0, 'V05'),           # T4–T12 (у V05 — наибольший кифоз)
    'T1slope': (25.0, 7.0, 'K10'),
    'CL': (16.5, 10.8, 'C18'),           # C2–C7, плюс — лордоз
    'SVA': (0.5, 2.5, 'D15'),            # см, плюс — C7 впереди S1; норма < 5
    'cSVA': (1.69, 1.06, 'C18'),         # см, C2 впереди C7 (H97)
}
# высоты костных точек (ANSUR II, мужчины 170–180 см): медиана и квартили — из anthro-ansur2.json по ключу
HEIGHTS = {'jugular': 'suprasternaleheight', 'cervicale': 'cervicaleheight', 'tenthrib': 'tenthribheight', 'iliocristale': 'iliocristaleheight'}

# ---------------------------------------------------------------- место для мышц спины
# Место для столба = (от кожи до пола костей по лучу вперёд) − слой над столбом (трапециевидная, ромбовидные, широчайшая,
# подкожный слой — BK.depth ветки осанки). При месте 4.61.0 (длиннейшая 2,2–3,7, подвздошно-рёберная 1,9–3,7) в спину
# помещается 87 и 93 % их объёма по МРТ (R26, README мышц); нужно не меньше, чем в 4.61.0.
BK_DEPTH = [[0, .45], [26, .45], [34, 1.0], [44, 1.2], [50, 1.8], [54, 2.6], [57, 3.2]]
ROOM_LINES = {'longissimus': 3.5, 'iliocostalis': 6.5}
ROOM_MIN = 2.2           # см: длиннейшая на T3–T10 — не меньше нижней границы 4.61.0
SCAP_MIN = 1.4           # S14: ткани над лопаткой не тоньше 14 мм


def ansur_target(ref, key):
    p25, p50, p75 = ref[key]; t = ANSUR_TONED[key][0]
    return {'p25': p25, 'p50': p50, 'p75': p75}[t]
