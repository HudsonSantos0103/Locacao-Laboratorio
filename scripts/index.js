const CONFIG = {
    turmasValidas: ["DS1", "DS2", "DS3", "MULTI1", "MULTI2", "MULTI3", "CTB1", "CTB2", "CTB3", "RDC1", "RDC2", "RDC3"],
    slots: ["07:20 - 08:10", "08:10 - 09:00", "09:20 - 10:10", "10:10 - 11:00", "11:00 - 11:50", "12:00 - 13:00", "13:10 - 14:00", "14:00 - 14:50", "15:10 - 16:00", "16:00 - 16:50"],
    cargosMonitoria: ["Fila (Álcool em Gel) Intervalo", "Sucos - Almoço", "Fila - Almoço", "Portaria - Almoço", "Fila - Tarde"]
};

let usuarioLogado = null;
let currentLab = "Lab Informática";

// --- HELPERS (Utilidades) ---
const storage = {
    set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
    get: (key) => JSON.parse(localStorage.getItem(key)),
    remove: (key) => localStorage.removeItem(key)
};

// --- AUTH (Login e Cadastro) ---
function toggleAuth(type) {
    document.getElementById('login-form').style.display = type === 'signup' ? 'none' : 'block';
    document.getElementById('signup-form').style.display = type === 'signup' ? 'block' : 'none';
}

function handleSignup() {
    const nome = document.getElementById('reg-nome').value.trim();
    const matricula = document.getElementById('reg-matricula').value.trim();
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const pass = document.getElementById('reg-pass').value;
    const cargo = document.getElementById('reg-cargo').value;

    if (!nome || !matricula || !email || pass.length < 6) {
        return alert("Dados inválidos. A senha deve ter pelo menos 6 caracteres.");
    }

    if (storage.get(`user-${email}`)) return alert("Este e-mail já está cadastrado.");

    const user = { nome, matricula, email, pass, cargo };
    storage.set(`user-${email}`, user);
    
    alert("Cadastro concluído!");
    toggleAuth('login');
}

function handleLogin() {
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const pass = document.getElementById('login-pass').value;
    const savedUser = storage.get(`user-${email}`);

    if (savedUser && savedUser.pass === pass) {
        usuarioLogado = savedUser;
        document.getElementById('auth-screen').classList.remove('active');
        document.getElementById('app-content').style.display = 'block';
        document.getElementById('welcome-user').innerText = `Olá, ${savedUser.cargo} ${savedUser.nome.split(' ')[0]}!`;
        showSection('menu');
    } else {
        alert("E-mail ou senha incorretos.");
    }
}

// --- NAVEGAÇÃO ---
function showSection(id) {
    if (!usuarioLogado) return; // Segurança básica

    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    
    if (id === 'menu') {
        document.getElementById('main-menu').classList.add('active');
    } else {
        const target = document.getElementById(`sec-${id}`);
        if (target) {
            target.classList.add('active');
            id === 'reservas' ? renderTable() : renderMonitoria();
        }
    }
}

// --- RESERVAS ---
function renderTable() {
    const tbody = document.getElementById('tableBody');
    const semana = document.getElementById('semanaSelect').value;
    const dia = document.getElementById('diaSelect').value;
    
    if (!tbody) return;
    tbody.innerHTML = '';

    CONFIG.slots.forEach((slot, index) => {
        const isLunch = slot === "12:00 - 13:00";
        const key = `reserva-${currentLab}-${semana}-${dia}-${slot}`;
        const saved = storage.get(key) || { prof: '', turma: '' };

        const row = document.createElement('tr');
        if (isLunch) row.className = 'lunch-break';
        if (saved.turma && !isLunch) row.className = 'reserved-row';

        row.innerHTML = `
            <td><strong>${slot}</strong></td>
            <td><input type="text" id="prof-${index}" class="form-input" value="${isLunch ? 'ALMOÇO' : saved.prof}" ${isLunch ? 'disabled' : ''}></td>
            <td><input type="text" id="turma-${index}" class="form-input" value="${isLunch ? '' : saved.turma}" ${isLunch ? 'disabled' : ''}></td>
            <td><button class="btn-save" onclick="saveBooking('${slot}', ${index})" ${isLunch ? 'disabled' : ''}>Salvar</button></td>
        `;
        tbody.appendChild(row);
    });
}

function saveBooking(slot, index) {
    const semana = document.getElementById('semanaSelect').value;
    const dia = document.getElementById('diaSelect').value;
    const prof = document.getElementById(`prof-${index}`).value.trim();
    const turma = document.getElementById(`turma-${index}`).value.trim().toUpperCase();

    if (!prof || !turma) return alert("Preencha todos os campos.");
    if (!CONFIG.turmasValidas.includes(turma)) return alert("Turma não autorizada!");

    storage.set(`reserva-${currentLab}-${semana}-${dia}-${slot}`, { prof, turma });
    alert("Reserva confirmada!");
    renderTable();
}

// --- MONITORIA ---
function renderMonitoria() {
    const tbody = document.getElementById('tableBodyMonitoria');
    const semana = document.getElementById('monSemanaSelect').value;
    const dia = document.getElementById('monDiaSelect').value;
    
    if (!tbody) return;
    tbody.innerHTML = '';

    CONFIG.cargosMonitoria.forEach((cargo, index) => {
        const key = `mon-S${semana}-${dia}-${cargo}`;
        const saved = storage.get(key) || { nome: '', turma: '' };

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${cargo}</strong></td>
            <td><input type="text" id="mon-nome-${index}" class="form-input" value="${saved.nome}"></td>
            <td><input type="text" id="mon-turma-${index}" class="form-input" value="${saved.turma}"></td>
            <td><button class="btn-save" onclick="saveMonitoria('${cargo}', ${index})">Gravar</button></td>
        `;
        tbody.appendChild(row);
    });
}

function saveMonitoria(cargo, index) {
    const semana = document.getElementById('monSemanaSelect').value;
    const dia = document.getElementById('monDiaSelect').value;
    const nome = document.getElementById(`mon-nome-${index}`).value.trim();
    const turma = document.getElementById(`mon-turma-${index}`).value.trim().toUpperCase();

    storage.set(`mon-S${semana}-${dia}-${cargo}`, { nome, turma });
    alert("Monitoria atualizada!");
}

// --- LOGOFF E RESET ---
function logout() {
    usuarioLogado = null;
    location.reload();
}

function checkAutoReset() {
    // Exemplo: Se for após as 17h, limpa apenas as reservas de laboratório
    if (new Date().getHours() >= 17) {
        Object.keys(localStorage).forEach(key => { 
            if (key.startsWith('reserva-')) storage.remove(key); 
        });
    }
}

window.onload = checkAutoReset;