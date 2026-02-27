export function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <i class="bi ${getIconForType(type)}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Animação de entrada
  setTimeout(() => toast.classList.add('show'), 10);

  // Remover após duração
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function getIconForType(type) {
  switch (type) {
    case 'success': return 'bi-check-circle-fill';
    case 'error': return 'bi-exclamation-triangle-fill';
    case 'warning': return 'bi-exclamation-circle-fill';
    default: return 'bi-info-circle-fill';
  }
}