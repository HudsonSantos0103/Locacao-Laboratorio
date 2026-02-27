import { Auth } from './modules/auth.js';
import { Dashboard } from './modules/dashboard.js';
import { Reservas } from './modules/reservas.js';
import { Monitoria } from './modules/monitoria.js';
import { Theme } from './modules/theme.js';

class App {
  constructor() {
    this.auth = new Auth();
    this.dashboard = new Dashboard();
    this.reservas = new Reservas();
    this.monitoria = new Monitoria();
    this.theme = new Theme();

    this.initGlobalListeners();
  }

  initGlobalListeners() {
    // Quando o usuário logar, inicializa os módulos que dependem do usuário
    window.addEventListener('user-logged-in', (e) => {
      this.dashboard.loadUserData(e.detail);
      this.reservas.init();
      this.monitoria.init();
    });

    // Navegação entre views
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const view = e.currentTarget.dataset.view;
        this.navigateTo(view);
      });
    });
  }

  navigateTo(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`view-${viewId}`).classList.add('active');

    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector(`.nav-link[data-view="${viewId}"]`).classList.add('active');

    // Atualizar título
    const titles = { menu: 'Dashboard', reservas: 'Laboratórios', monitoria: 'Monitoria' };
    document.getElementById('page-title').innerText = titles[viewId];

    // Se for monitoria, renderiza
    if (viewId === 'monitoria') this.monitoria.render();
  }
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});