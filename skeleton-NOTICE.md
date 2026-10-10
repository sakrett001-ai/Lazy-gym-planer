# Кости манекена: MyoSim

`src/data/skeleton.bin` — производные данные: сетки костей из библиотеки моделей **MyoSim**
(MyoHub, https://github.com/MyoHub/myo_sim, коммит 93b0ca8, лицензия Apache 2.0 — см. `LICENSE` рядом),
упрощённые и пересчитанные в рамки сегментов манекена Lazy Gym Planner (`tools/skeleton/`).
Изменения: сетки упрощены (≈36,6 тыс. треугольников), масштабированы и перенесены в локальные координаты сегментов,
из сетки грудной клетки удалены внутренние органы; левая рука получена зеркально из правой.

Модели MyoSim построены на моделях OpenSim; их авторы:
- Rajagopal A., Dembia C. L., DeMers M. S., Delp D. D., Hicks J. L., Delp S. L. Full-body musculoskeletal model for
  muscle-driven simulation of human gait. IEEE Transactions on Biomedical Engineering, 2016. doi:10.1109/TBME.2016.2586891
- Holzbaur K. R. S., Murray W. M., Delp S. L. A model of the upper extremity for simulating musculoskeletal surgery and
  analyzing neuromuscular control. Annals of Biomedical Engineering, 2005. doi:10.1007/s10439-005-3320-7
- Модель поясничного отдела позвоночника (SimTK lumbarspine); MyoBack — Walia et al., IROS 2025.
- Caggiano V., Wang H., Durandau G., Sartori M., Kumar V. MyoSuite: a contact-rich simulation suite for musculoskeletal
  motor control, 2022. doi:10.48550/ARXIV.2205.13600
