export class Calendar {
  constructor(containerId, monthYearId, options = {}) {
    this.container = document.getElementById(containerId);
    this.monthYearDisplay = document.getElementById(monthYearId);
    this.currentDate = options.initialDate || new Date();
    this.onDateSelect = options.onDateSelect || (() => {});
    this.selectedDate = options.selectedDate || new Date();
  }

  render() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    this.monthYearDisplay.innerText = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(this.currentDate);

    const firstDay = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();

    let html = '';
    for (let i = 0; i < firstDay; i++) {
      html += '<div class="day empty"></div>';
    }

    for (let d = 1; d <= lastDay; d++) {
      const dateObj = new Date(year, month, d);
      const isSelected = dateObj.toDateString() === this.selectedDate.toDateString();
      html += `<div class="day ${isSelected ? 'active' : ''}" data-date="${dateObj.toISOString()}">${d}</div>`;
    }

    this.container.innerHTML = html;

    // Adiciona eventos
    this.container.querySelectorAll('.day:not(.empty)').forEach(day => {
      day.addEventListener('click', (e) => {
        const dateStr = e.target.dataset.date;
        const date = new Date(dateStr);
        this.selectedDate = date;
        this.onDateSelect(date);
        this.render(); // re-renderiza para atualizar a classe active
      });
    });
  }

  changeMonth(direction) {
    this.currentDate.setMonth(this.currentDate.getMonth() + direction);
    this.render();
  }
}