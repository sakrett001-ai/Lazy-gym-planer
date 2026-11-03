/* Каталог в объёме: каждое упражнение показывается манекеном (09bm) с запечёнными ключами поз (tools/mannequin →
   09bp-poses.js) и параметрическим инвентарём (09bn, 09bo). Координаты — сантиметры, Y вниз; все ракурсы проецируют одну
   и ту же позу. Упражнение без запечённой позы фигуры не получает (проверка — tools/catalog-audit.js, правило rig). */
const CATALOG_CAMERAS=['above','angle','side','front','back'];
for(const ex of EX){
 const entry=CATALOG_POSES[ex.id];if(!entry)continue;
 /* поза по умолчанию — без необязательного инвентаря; варианты хвата (variants) — для показа с ним (catalogAnimFor) */
 const rig=GymEquipment.rig(GymEquipment.variantEntry(entry,()=>false));
 if(entry.variants)ex.anim.catalogVariants=Object.fromEntries(Object.keys(entry.variants).map(v=>[v,GymEquipment.rig(GymEquipment.variantEntry(entry,k=>k===v))]));
 ex.anim.catalogRig=rig;ex.anim.catalogCameras=[...CATALOG_CAMERAS];ex.anim.catalogId=ex.id;
 if(entry.loop)ex.anim.loop=true;
}
