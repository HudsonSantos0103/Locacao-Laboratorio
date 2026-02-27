const CONFIG = {
    slots: ["07:20 - 08:10", "08:10 - 09:00", "09:20 - 10:10", "10:10 - 11:00", "11:00 - 11:50", "12:00 - 13:00", "13:10 - 14:00", "14:00 - 14:50", "15:10 - 16:00", "16:00 - 16:50"],
    postosMonitoria: ["Fila do Intervalo", "Refeitório (Suco)", "Refeitório (Pratos)", "Portaria Almoço", "Pátio Central"],
};

let currentLab = "Lab Informática";
let calendarViewDate = new Date();
let selectedDateStr = "";

const storage = {
    set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
    get: (key) => JSON.parse(localStorage.getItem(key))
};

// === AUXILIARES ===
function showToast(msg) {
    const c = document.getElementById('toast-container');
    const t = document.createElement('div'); t.className = 'toast'; t.innerText = msg;
    c.appendChild(t); setTimeout(() => t.remove(), 3000);
}

const formatDateKey = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

// === AUTENTICAÇÃO ===
function toggleAuth(type) {
    document.getElementById('login-form').style.display = type === 'signup' ? 'none' : 'block';
    document.getElementById('signup-form').style.display = type === 'signup' ? 'block' : 'none';
}

function handleLogin() {
    const email = document.getElementById('login-email').value.toLowerCase().trim();
    const pass = document.getElementById('login-pass').value;
    const user = storage.get(`user-${email}`);

    if (user && user.pass === pass) {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('sys-header').style.display = 'flex';
        document.getElementById('app-content').style.display = 'block';
        document.getElementById('user-display-name').innerText = user.nome;
        showSection('menu');
    } else { showToast("Credenciais inválidas"); }
}

function handleSignup() {
    const email = document.getElementById('reg-email').value;
    const nome = document.getElementById('reg-nome').value;
    const pass = document.getElementById('reg-pass').value;
    if(pass.length < 6) return showToast("Senha curta demais");
    storage.set(`user-${email}`, { nome, pass });
    showToast("Cadastrado! Faça login.");
    toggleAuth('login');
}

function logout() { location.reload(); }

// === NAVEGAÇÃO ===
function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(id === 'menu' ? 'main-menu' : `sec-${id}`).classList.add('active');
    if(id === 'reservas') {
        if(!selectedDateStr) selectDate(new Date());
        renderCalendar();
    } else if(id === 'monitoria') {
        renderMonitoria();
    }
}

// === CALENDÁRIO ===
function changeMonth(dir) {
    calendarViewDate.setMonth(calendarViewDate.getMonth() + dir);
    renderCalendar();
}

function selectDate(date) {
    selectedDateStr = formatDateKey(date);
    document.getElementById('selectedDateDisplay').innerText = date.toLocaleDateString('pt-BR', { dateStyle: 'long' });
    renderCalendar();
    renderTable();
}

function renderCalendar() {
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    
    document.getElementById('monthYearDisplay').innerText = `${monthNames[month]} ${year}`;
    const container = document.getElementById('calendarDays');
    container.innerHTML = '';

    const firstDay = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();

    for(let i=0; i<firstDay; i++) container.innerHTML += '<div class="cal-day empty"></div>';

    for(let i=1; i<=lastDay; i++) {
        const d = new Date(year, month, i);
        const dStr = formatDateKey(d);
        const hasBooking = CONFIG.slots.some(s => storage.get(`res-${currentLab}-${dStr}-${s}`));
        
        const div = document.createElement('div');
        div.className = `cal-day ${dStr === selectedDateStr ? 'active' : ''} ${hasBooking ? 'has-booking' : ''}`;
        div.innerText = i;
        div.onclick = () => selectDate(d);
        container.appendChild(div);
    }
}

// === RESERVAS ===
function changeLab(lab, btn) {
    currentLab = lab;
    document.querySelectorAll('.btn-lab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderCalendar();
    renderTable();
}

function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    CONFIG.slots.forEach((slot, i) => {
        const isLunch = slot.includes("12:00");
        const saved = storage.get(`res-${currentLab}-${selectedDateStr}-${slot}`) || { prof: '', turma: '' };
        const row = document.createElement('tr');
        if (isLunch) {
            row.innerHTML = `<td colspan="4" style="text-align:center; background:#fef3c7; color:#d97706; font-weight:700">🍱 ALMOÇO</td>`;
        } else {
            row.innerHTML = `
                <td><strong>${slot}</strong></td>
                <td><input type="text" id="p-${i}" value="${saved.prof}"></td>
                <td><input type="text" id="t-${i}" value="${saved.turma}"></td>
                <td><button class="btn-save" onclick="saveBooking('${slot}', ${i})">Salvar</button></td>
            `;
        }
        tbody.appendChild(row);
    });
}

function saveBooking(slot, i) {
    const data = { prof: document.getElementById(`p-${i}`).value, turma: document.getElementById(`t-${i}`).value.toUpperCase() };
    storage.set(`res-${currentLab}-${selectedDateStr}-${slot}`, data);
    showToast("Reserva salva!");
    renderCalendar();
}

function clearDay() {
    if(!confirm("Limpar tudo?")) return;
    CONFIG.slots.forEach(s => localStorage.removeItem(`res-${currentLab}-${selectedDateStr}-${s}`));
    renderTable(); renderCalendar();
}

// === MONITORIA ===
function renderMonitoria() {
    const tbody = document.getElementById('tableBodyMonitoria');
    tbody.innerHTML = '';
    CONFIG.postosMonitoria.forEach((p, i) => {
        const saved = storage.get(`mon-${p}`) || { aluno: '', turma: '' };
        tbody.innerHTML += `
            <tr>
                <td><strong>${p}</strong></td>
                <td><input type="text" id="mn-${i}" value="${saved.aluno}"></td>
                <td><input type="text" id="mt-${i}" value="${saved.turma}"></td>
                <td><button class="btn-save" onclick="saveMon('${p}', ${i})">Salvar</button></td>
            </tr>`;
    });
}

function saveMon(p, i) {
    storage.set(`mon-${p}`, { aluno: document.getElementById(`mn-${i}`).value, turma: document.getElementById(`mt-${i}`).value });
    showToast("Escala salva!");
}

function toggleDarkMode() {
    document.body.classList.toggle('dark');
    document.getElementById('darkModeBtn').innerText = document.body.classList.contains('dark') ? '☀️' : '🌙';
}