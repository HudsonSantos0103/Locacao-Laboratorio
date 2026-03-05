const CONFIG = {
    slots: ["07:20 - 08:10", "08:10 - 09:00", "09:20 - 10:10", "10:10 - 11:00", "11:00 - 11:50", "12:00 - 13:00", "13:10 - 14:00", "14:00 - 14:50", "15:10 - 16:00", "16:00 - 16:50"],
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
        id === 'reservas' ? renderTable() : renderMonitoria();
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark');
    const btn = document.getElementById('darkModeBtn');
    btn.innerText = document.body.classList.contains('dark') ? '☀️' : '🌙';
}

// === MÓDULO LABORATÓRIOS ===
function changeLab(lab, btn) {
    currentLab = lab;
    document.querySelectorAll('.btn-lab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTable();
}

function renderTable() {
    const tbody = document.getElementById('tableBody');
    const sem = document.getElementById('semanaSelect').value;
    const dia = document.getElementById('diaSelect').value;
    tbody.innerHTML = '';

    CONFIG.slots.forEach((slot, i) => {
        const isLunch = slot.includes("12:00");
        const key = `res-${currentLab}-S${sem}-${dia}-${slot}`;
        const saved = storage.get(key) || { prof: '', turma: '' };

        const row = document.createElement('tr');
        if (isLunch) {
            row.innerHTML = `<td colspan="4" class="lunch-break">🍱 INTERVALO DE ALMOÇO</td>`;
        } else {
            row.innerHTML = `
                <td><strong>${slot}</strong></td>
                <td><input type="text" id="p-${i}" value="${saved.prof}" placeholder="Nome do Professor"></td>
                <td><input type="text" id="t-${i}" value="${saved.turma}" placeholder="Turma"></td>
                <td><button class="btn-save" onclick="saveBooking('${slot}', ${i})">Salvar</button></td>
            `;
        }
        tbody.appendChild(row);
    });
}

function saveBooking(slot, i) {
    const sem = document.getElementById('semanaSelect').value;
    const dia = document.getElementById('diaSelect').value;
    const data = { 
        prof: document.getElementById(`p-${i}`).value, 
        turma: document.getElementById(`t-${i}`).value.toUpperCase() 
    };
    storage.set(`res-${currentLab}-S${sem}-${dia}-${slot}`, data);
    showToast("Salvo!");
}

function copyPreviousWeek() {
    const sem = parseInt(document.getElementById('semanaSelect').value);
    if(sem === 1) return showToast("⚠️ Não há semana anterior para copiar!");
    
    const dia = document.getElementById('diaSelect').value;
    CONFIG.slots.forEach(slot => {
        const prevKey = `res-${currentLab}-S${sem-1}-${dia}-${slot}`;
        const currKey = `res-${currentLab}-S${sem}-${dia}-${slot}`;
        const saved = storage.get(prevKey);
        if(saved) storage.set(currKey, saved);
    });
    renderTable();
    showToast("✅ Dados copiados da semana " + (sem-1));
}

function clearDay() {
    if(!confirm("Tem certeza que deseja limpar as reservas deste dia?")) return;
    const sem = document.getElementById('semanaSelect').value;
    const dia = document.getElementById('diaSelect').value;
    CONFIG.slots.forEach(slot => {
        localStorage.removeItem(`res-${currentLab}-S${sem}-${dia}-${slot}`);
    });
    renderTable();
    showToast("🧹 Dia limpo!");
}

// === MÓDULO MONITORIA ===
function renderMonitoria() {
    const tbody = document.getElementById('tableBodyMonitoria');
    tbody.innerHTML = '';
    CONFIG.postosMonitoria.forEach((posto, i) => {
        const saved = storage.get(`mon-${posto}`) || { aluno: '', turma: '' };
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${posto}</strong></td>
            <td><input type="text" id="mn-${i}" value="${saved.aluno}" placeholder="Nome do Aluno"></td>
            <td><input type="text" id="mt-${i}" value="${saved.turma}" placeholder="Turma"></td>
            <td><button class="btn-save" onclick="saveMon('${posto}', ${i})">Salvar</button></td>
        `;
        tbody.appendChild(row);
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