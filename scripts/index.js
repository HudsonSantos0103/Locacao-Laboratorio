// Configurações específicas da EEEP
const CONFIG = {
    slots: ["07:20 - 08:10 (1º Hor)", "08:10 - 09:00 (2º Hor)", "09:20 - 10:10 (3º Hor)", "10:10 - 11:00 (4º Hor)", "11:00 - 11:50 (5º Hor)", "12:00 - 13:00", "13:10 - 14:00 (6º Hor)", "14:00 - 14:50 (7º Hor)", "15:10 - 16:00 (8º Hor)", "16:00 - 16:50 (9º Hor)"],
    postosMonitoria: ["Recepção Principal", "Apoio Coordenação", "Refeitório (Entrada)", "Refeitório (Organização)", "Biblioteca", "Laboratórios (Apoio)"],
    // Exemplo de turmas técnicas comuns em EEEPs
    turmasValidas: ["1º INFO", "2º INFO", "3º INFO", "1º ENF", "2º ENF", "3º ENF", "1º ADM", "2º ADM", "3º ADM"] 
};

let currentLab = "Lab Informática 1";

const storage = {
    set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
    get: (key) => JSON.parse(localStorage.getItem(key))
};

function showToast(msg, type = 'success') {
    const c = document.getElementById('toast-container');
    const t = document.createElement('div'); 
    t.className = 'toast'; 
    t.innerHTML = msg;
    // Muda a cor da borda se for erro
    if (type === 'error') t.style.borderLeftColor = '#e74c3c';
    c.appendChild(t); setTimeout(() => t.remove(), 3500);
}

// --- AUTENTICAÇÃO ---
function toggleAuth(type) {
    document.getElementById('login-form').style.display = type === 'signup' ? 'none' : 'block';
    document.getElementById('signup-form').style.display = type === 'signup' ? 'block' : 'none';
}

function handleSignup() {
    const email = document.getElementById('reg-email').value.toLowerCase().trim();
    const user = { 
        nome: document.getElementById('reg-nome').value, 
        pass: document.getElementById('reg-pass').value, 
        cargo: document.getElementById('reg-cargo').value 
    };

    if(!email || !user.nome || !user.cargo || user.pass.length < 6) {
        return showToast("⚠️ Preencha todos os campos. Senha mín. 6 dígitos.", 'error');
    }
    
    if(storage.get(`user-${email}`)) return showToast("❌ E-mail já cadastrado no sistema.", 'error');

    storage.set(`user-${email}`, user);
    showToast("✅ Cadastro realizado com sucesso! Faça login.");
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
        
        document.getElementById('user-info').innerText = `${saved.cargo} | ${saved.nome.split(' ')[0]}`;
        document.getElementById('user-name-display').innerText = saved.nome.split(' ')[0];
        
        showSection('menu');
        showToast(`👋 Bem-vindo(a), ${saved.nome}!`);
    } else {
        showToast("❌ Credenciais inválidas. Verifique e-mail e senha.", 'error');
    }
}

// --- NAVEGAÇÃO ---
function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    if (id === 'menu') {
        document.getElementById('main-menu').classList.add('active');
    } else {
        document.getElementById(`sec-${id}`).classList.add('active');
        id === 'reservas' ? renderTable() : renderMonitoria();
    }
}

// --- MÓDULO LABORATÓRIOS ---
function changeLab(lab, btn) {
    currentLab = lab;
    document.getElementById('currentLabTitle').innerText = lab;
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
        const key = `res-${currentLab}-S${sem}-${dia}-${i}`; // Usando índice 'i' para chave única
        const saved = storage.get(key) || { prof: '', turma: '' };

        const row = document.createElement('tr');
        if (isLunch) {
            row.innerHTML = `<td colspan="4" class="lunch-break">🥗 INTERVALO DE ALMOÇO E DESCANSO</td>`;
        } else {
            row.innerHTML = `
                <td style="font-weight:600; color:var(--school-green);">${slot}</td>
                <td><input type="text" id="p-${i}" value="${saved.prof}" placeholder="Nome do Professor(a)"></td>
                <td><input type="text" id="t-${i}" value="${saved.turma}" placeholder="Ex: 2º INFO"></td>
                <td><button class="btn-save" onclick="saveBooking(${i})">Agendar</button></td>
            `;
        }
        tbody.appendChild(row);
    });
}

function saveBooking(i) {
    const sem = document.getElementById('semanaSelect').value;
    const dia = document.getElementById('diaSelect').value;
    const profVal = document.getElementById(`p-${i}`).value.trim();
    const turmaVal = document.getElementById(`t-${i}`).value.trim().toUpperCase();

    const key = `res-${currentLab}-S${sem}-${dia}-${i}`;

    if (!profVal && !turmaVal) {
        storage.remove(key);
        showToast("🗑️ Agendamento removido.");
    } else {
        storage.set(key, { prof: profVal, turma: turmaVal });
        showToast("✅ Horário agendado com sucesso!");
    }
    renderTable(); // Atualiza para mostrar visualmente
}

// --- MÓDULO MONITORIA ---
function renderMonitoria() {
    const tbody = document.getElementById('tableBodyMonitoria');
    tbody.innerHTML = '';
    CONFIG.postosMonitoria.forEach((posto, i) => {
        const saved = storage.get(`mon-${posto}`) || { aluno: '', turma: '' };
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="font-weight:600; color:var(--school-green);">${posto}</td>
            <td><input type="text" id="mn-${i}" value="${saved.aluno}" placeholder="Nome Completo do Aluno"></td>
            <td><input type="text" id="mt-${i}" value="${saved.turma}" placeholder="Turma do Aluno"></td>
            <td><button class="btn-save" onclick="saveMon('${posto}', ${i})">Definir</button></td>
        `;
        tbody.appendChild(row);
    });
}

function saveMon(posto, i) {
    const data = { 
        aluno: document.getElementById(`mn-${i}`).value.trim(), 
        turma: document.getElementById(`mt-${i}`).value.trim().toUpperCase() 
    };
    if(!data.aluno) {
        storage.remove(`mon-${posto}`);
        showToast("🗑️ Posto liberado.");
    } else {
        storage.set(`mon-${posto}`, data);
        showToast("✅ Monitor definido para o posto!");
    }
    renderMonitoria();
}

function logout() { 
    if(confirm("Deseja realmente sair do sistema?")) {
        location.reload(); 
    }
}