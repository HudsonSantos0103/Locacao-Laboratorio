const CONFIG = {
    slots: ["07:20 - 08:10", "08:10 - 09:00", "09:20 - 10:10", "10:10 - 11:00", "11:00 - 11:50", "12:00 - 13:00", "13:10 - 14:00", "14:00 - 14:50", "15:10 - 16:00", "16:00 - 16:50"],
    dias: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"],
    postosMonitoria: ["Fila do Intervalo", "Refeitório (Suco)", "Refeitório (Pratos)", "Portaria Almoço", "Pátio Central", "Fila Almoço"],
    turmasValidas: ["DS1", "DS2", "DS3", "MULTI1", "MULTI2", "MULTI3", "CTB1", "CTB2", "CTB3", "RDC1", "RDC2", "RDC3"]
};

let currentLab = "Lab Informática";

const storage = {
    set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
    get: (key) => JSON.parse(localStorage.getItem(key))
};

function showToast(msg) {
    const c = document.getElementById('toast-container');
    const t = document.createElement('div'); t.className = 'toast'; t.innerText = msg;
    c.appendChild(t); setTimeout(() => t.remove(), 3000);
}

// === LÓGICA DE AUTENTICAÇÃO ===
function toggleAuth(type) {
    document.getElementById('login-form').style.display = type === 'signup' ? 'none' : 'block';
    document.getElementById('signup-form').style.display = type === 'signup' ? 'block' : 'none';
}

function togglePassword(id) {
    const input = document.getElementById(id);
    input.type = input.type === 'password' ? 'text' : 'password';
}

function checkPasswordStrength(val) {
    const bar = document.getElementById('strength-bar');
    if(val.length === 0) { bar.className = 'strength-bar'; }
    else if(val.length < 6) { bar.className = 'strength-bar strength-weak'; }
    else if(val.length < 8) { bar.className = 'strength-bar strength-medium'; }
    else { bar.className = 'strength-bar strength-strong'; }
}

function handleSignup() {
    const email = document.getElementById('reg-email').value.toLowerCase().trim();
    const user = { nome: document.getElementById('reg-nome').value, pass: document.getElementById('reg-pass').value, cargo: document.getElementById('reg-cargo').value };
    if(!email || user.pass.length < 6) return showToast("Dados inválidos ou senha curta!");
    storage.set(`user-${email}`, user);
    showToast("✅ Cadastro realizado!");
    toggleAuth('login');
}

function handleLogin() {
    const email = document.getElementById('login-email').value.toLowerCase().trim();
    const pass = document.getElementById('login-pass').value;
    const saved = storage.get(`user-${email}`);

    if (saved && saved.pass === pass) {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('sys-header').style.display = 'flex';
        document.getElementById('app-content').style.display = 'block';
        document.getElementById('user-info').innerText = `${saved.cargo}: ${saved.nome}`;
        showSection('menu');
        showToast("Bem-vindo!");
    } else {
        showToast("❌ E-mail ou senha incorretos.");
    }
}

function logout() { location.reload(); }

// === NAVEGAÇÃO E MODO ESCURO ===
function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    if (id === 'menu') {
        document.getElementById('main-menu').classList.add('active');
    } else {
        document.getElementById(`sec-${id}`).classList.add('active');
        id === 'reservas' ? renderCalendar() : renderMonitoria();
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark');
    const btn = document.getElementById('darkModeBtn');
    btn.innerText = document.body.classList.contains('dark') ? '☀️' : '🌙';
}

// === MÓDULO LABORATÓRIOS (CALENDÁRIO) ===
function changeLab(lab, btn) {
    currentLab = lab;
    document.querySelectorAll('.btn-lab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderCalendar();
}

function renderCalendar() {
    const tbody = document.getElementById('calendarBody');
    const sem = document.getElementById('semanaSelect').value;
    tbody.innerHTML = '';

    CONFIG.slots.forEach(slot => {
        const row = document.createElement('tr');
        const isLunch = slot.includes("12:00");

        if (isLunch) {
            row.innerHTML = `<td class="time-col"><strong>${slot}</strong></td><td colspan="5" class="lunch-break">🍱 INTERVALO DE ALMOÇO</td>`;
        } else {
            let cellsHTML = `<td class="time-col"><strong>${slot}</strong></td>`;
            
            CONFIG.dias.forEach(dia => {
                const key = `res-${currentLab}-S${sem}-${dia}-${slot}`;
                const saved = storage.get(key);
                
                if (saved && saved.prof) {
                    // Célula Preenchida
                    cellsHTML += `
                        <td class="calendar-cell filled" onclick="openModal('${dia}', '${slot}')">
                            <div class="res-turma">${saved.turma}</div>
                            <div class="res-prof">${saved.prof}</div>
                        </td>`;
                } else {
                    // Célula Vazia
                    cellsHTML += `
                        <td class="calendar-cell empty" onclick="openModal('${dia}', '${slot}')">
                            <span>+ Reservar</span>
                        </td>`;
                }
            });
            row.innerHTML = cellsHTML;
        }
        tbody.appendChild(row);
    });
}

function copyPreviousWeek() {
    const sem = parseInt(document.getElementById('semanaSelect').value);
    if(sem === 1) return showToast("⚠️ Não há semana anterior para copiar!");
    
    CONFIG.slots.forEach(slot => {
        CONFIG.dias.forEach(dia => {
            const prevKey = `res-${currentLab}-S${sem-1}-${dia}-${slot}`;
            const currKey = `res-${currentLab}-S${sem}-${dia}-${slot}`;
            const saved = storage.get(prevKey);
            if(saved) storage.set(currKey, saved);
        });
    });
    renderCalendar();
    showToast("✅ Dados copiados da semana " + (sem-1));
}

function clearWeek() {
    if(!confirm("Tem certeza que deseja limpar TODAS as reservas desta semana para este laboratório?")) return;
    const sem = document.getElementById('semanaSelect').value;
    
    CONFIG.slots.forEach(slot => {
        CONFIG.dias.forEach(dia => {
            localStorage.removeItem(`res-${currentLab}-S${sem}-${dia}-${slot}`);
        });
    });
    renderCalendar();
    showToast("🧹 Semana limpa!");
}

// === MODAL DE RESERVAS ===
function openModal(dia, slot) {
    const sem = document.getElementById('semanaSelect').value;
    const key = `res-${currentLab}-S${sem}-${dia}-${slot}`;
    const saved = storage.get(key) || { prof: '', turma: '' };

    document.getElementById('modal-dia').value = dia;
    document.getElementById('modal-slot').value = slot;
    document.getElementById('modal-prof').value = saved.prof;
    document.getElementById('modal-turma').value = saved.turma;
    
    document.getElementById('modal-title').innerText = saved.prof ? "Editar Reserva" : "Nova Reserva";
    document.getElementById('modal-subtitle').innerText = `${currentLab} | Semana ${sem} | ${dia} | ${slot}`;
    
    document.getElementById('btn-delete-res').style.display = saved.prof ? 'block' : 'none';
    
    document.getElementById('res-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('res-modal').classList.remove('active');
}

function saveReservation() {
    const sem = document.getElementById('semanaSelect').value;
    const dia = document.getElementById('modal-dia').value;
    const slot = document.getElementById('modal-slot').value;
    
    const prof = document.getElementById('modal-prof').value.trim();
    const turma = document.getElementById('modal-turma').value.trim().toUpperCase();

    if(!prof || !turma) return showToast("⚠️ Preencha Professor e Turma!");

    storage.set(`res-${currentLab}-S${sem}-${dia}-${slot}`, { prof, turma });
    closeModal();
    renderCalendar();
    showToast("✅ Reserva salva!");
}

function deleteReservation() {
    if(!confirm("Deseja realmente excluir esta reserva?")) return;
    const sem = document.getElementById('semanaSelect').value;
    const dia = document.getElementById('modal-dia').value;
    const slot = document.getElementById('modal-slot').value;
    
    localStorage.removeItem(`res-${currentLab}-S${sem}-${dia}-${slot}`);
    closeModal();
    renderCalendar();
    showToast("🗑️ Reserva excluída!");
}

// === MÓDULO MONITORIA (CARDS) ===
function renderMonitoria() {
    const grid = document.getElementById('monitoriaGrid');
    grid.innerHTML = '';
    
    CONFIG.postosMonitoria.forEach((posto, i) => {
        const saved = storage.get(`mon-${posto}`) || { aluno: '', turma: '' };
        const card = document.createElement('div');
        card.className = 'monitoria-card';
        card.innerHTML = `
            <div class="mon-header">📍 ${posto}</div>
            <div class="mon-body">
                <input type="text" id="mn-${i}" value="${saved.aluno}" placeholder="Nome do Aluno">
                <input type="text" id="mt-${i}" value="${saved.turma}" placeholder="Turma">
                <button class="btn-save" onclick="saveMon('${posto}', ${i})">Salvar Posto</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function saveMon(posto, i) {
    const data = { 
        aluno: document.getElementById(`mn-${i}`).value, 
        turma: document.getElementById(`mt-${i}`).value.toUpperCase() 
    };
    storage.set(`mon-${posto}`, data);
    showToast("Escala Atualizada!");
}