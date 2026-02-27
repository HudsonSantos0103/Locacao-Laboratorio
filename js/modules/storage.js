// Abstração do localStorage com prefixo e tratamento de erros
const STORAGE_PREFIX = 'mg_sge_';

export const storage = {
  save(key, value) {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Erro ao salvar no localStorage', e);
      return false;
    }
  },

  get(key) {
    try {
      const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Erro ao ler do localStorage', e);
      return null;
    }
  },

  remove(key) {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  },

  clear() {
    // Limpa apenas itens com o prefixo
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }
};