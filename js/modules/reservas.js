import { storage } from './storage.js';
import { showToast } from '../utils/notifications.js';
import { formatDateToKey, getCurrentDateLabel } from '../utils/helpers.js';
import { Calendar } from './calendar.js';

export class Reservas {
  constructor() {
    this.currentLab = 'Informática';
    this.selectedDate = new Date();
    this.slots = [
      "07:20 - 08:10", "08:10 - 09:00", "09:20 - 10:10", "10:10 - 11:00",
      "11:00 - 11:50", "12:00 - 13:00 (Intervalo)", "13:10 - 14:00",
      "14:00 - 14:50", "15:10 - 16:00", "16:00 - 16:50"
    ];

    this.calendar = new Calendar('cal-days', 'cal-month-year', {
      onDateSelect: (date) => {
        this.selectedDate = date;
        this.render();
      }
    });
  }

  init() {
    this.calendar.render();
    this.render();
    this.attachEvents();
  }

  attachEvents() {
    document.querySelectorAll('.seg-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setLab(e.target.dataset.lab, e.target);
      });
    });

    document.getElementById('clear-day-btn')?.addEventListener('click', () => {
      this.clearDay();
    });
  }

  setLab(lab, btn) {
    this.currentLab = lab;
    document.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    this.render();
  }

  render() {
    const tbody = document.getElementById('reserva-rows');
    const dateKey = formatDateToKey(this.selectedDate);
    document.getElementById('current-date-label').innerText = getCurrentDateLabel(this.selectedDate);

    tbody.innerHTML = '';
    this.slots.forEach((slot, index) => {
      const resKey = `res_${this.currentLab}_${dateKey}_${index}`;
      const saved = storage.get(resKey) || { prof: '', turma: '' };
      const isInterval = slot.includes('Intervalo');

      const tr = document.createElement('tr');
      if (isInterval) {
        tr.innerHTML = `<td colspan="4" class="interval-cell">☕ ${slot}</td>`;
      } else {
        tr.innerHTML = `
          <td><strong>${slot}</strong></td>
          <td><input type="text" class="reserva-prof" data-index="${index}" value="${saved.prof}" placeholder="Professor(a)"></td>
          <td><input type="text" class="reserva-turma" data-index="${index}" value="${saved.turma}" placeholder="Turma"></td>
          <td><span class="badge ${saved.prof ? 'booked' : 'free'}">${saved.prof ? 'Reservado' : 'Disponível'}</span></td>
        `;
      }
      tbody.appendChild(tr);
    });

    // Adiciona eventos aos inputs depois de renderizar
    tbody.querySelectorAll('.reserva-prof, .reserva-turma').forEach(input => {
      input.addEventListener('change', (e) => {
        const index = e.target.dataset.index;
        const field = e.target.classList.contains('reserva-prof') ? 'prof' : 'turma';
        this.saveReserva(index, field, e.target.value);
      });
    });
  }

  saveReserva(index, field, value) {
    const dateKey = formatDateToKey(this.selectedDate);
    const key = `res_${this.currentLab}_${dateKey}_${index}`;
    let data = storage.get(key) || { prof: '', turma: '' };
    data[field] = field === 'turma' ? value.toUpperCase() : value;
    storage.save(key, data);
    this.render(); // Re-renderiza para atualizar o badge
    showToast('Reserva atualizada', 'success');
  }

  clearDay() {
    if (!confirm('Tem certeza que deseja limpar todas as reservas deste dia?')) return;
    const dateKey = formatDateToKey(this.selectedDate);
    this.slots.forEach((_, index) => {
      const key = `res_${this.currentLab}_${dateKey}_${index}`;
      storage.remove(key);
    });
    this.render();
    showToast('Reservas do dia removidas', 'info');
  }
}