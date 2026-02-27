import { storage } from './storage.js';
import { showToast } from '../utils/notifications.js';

export class Auth {
  constructor() {
    this.currentUser = null;
    this.initEventListeners();
    this.checkSession();
  }

  initEventListeners() {
    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    document.getElementById('signup-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSignup();
    });
  }

  handleLogin() {
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-pass').value;

    if (!email || !password) {
      showToast('Preencha todos os campos', 'error');
      return;
    }

    const user = storage.get(`user_${email}`);
    if (user && user.password === password) { // Simulação: em produção, compare hash
      this.currentUser = user;
      storage.save('current_session', user.email);
      showToast('Login realizado com sucesso!', 'success');
      this.redirectToDashboard();
    } else {
      showToast('E-mail ou senha inválidos', 'error');
    }
  }

  handleSignup() {
    const nome = document.getElementById('reg-nome').value.trim();
    const cargo = document.getElementById('reg-cargo').value;
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const password = document.getElementById('reg-pass').value;

    if (!nome || !cargo || !email || !password) {
      showToast('Preencha todos os campos', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('A senha deve ter no mínimo 6 caracteres', 'error');
      return;
    }

    if (storage.get(`user_${email}`)) {
      showToast('Este e-mail já está cadastrado', 'error');
      return;
    }

    const user = { nome, cargo, email, password }; // Em produção, não armazene senha em texto puro!
    storage.save(`user_${email}`, user);
    showToast('Conta criada! Faça login.', 'success');
    toggleAuth('login');
  }

  checkSession() {
    const sessionEmail = storage.get('current_session');
    if (sessionEmail) {
      const user = storage.get(`user_${sessionEmail}`);
      if (user) {
        this.currentUser = user;
        this.redirectToDashboard();
      }
    }
  }

  redirectToDashboard() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'flex';
    // Dispara evento para o dashboard carregar com o usuário
    window.dispatchEvent(new CustomEvent('user-logged-in', { detail: this.currentUser }));
  }

  logout() {
    this.currentUser = null;
    storage.remove('current_session');
    location.reload(); // ou transição suave
  }
}

// Funções auxiliares para UI (toggle forms, mostrar senha)
export function toggleAuth(type) {
  document.getElementById('login-form').style.display = type === 'login' ? 'block' : 'none';
  document.getElementById('signup-form').style.display = type === 'signup' ? 'block' : 'none';
}

export function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const type = input.type === 'password' ? 'text' : 'password';
  input.type = type;
  // Opcional: trocar ícone
}