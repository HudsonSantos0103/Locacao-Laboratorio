/**
 * SISTEMA DE GESTÃO ESCOLAR - CORE ENGINE
 * @author Senior Dev
 * @version 2.0.0
 */

// 1. STATE MANAGEMENT
const state = {
    user: null,
    currentLab: "Informática",
    selectedDate: new Date(),
    calendarDate: new Date(), // Mês visível no calendário
    config: {
        slots: ["07:20 - 08:10", "08:10 - 09:00", "09:20 - 10:10", "10:10 - 11:00", "11:00 - 11:50", "12:00 - 13:00 (Almoço)", "13:10 - 14:00", "14:00 - 14:50", "15:10 - 16:00", "16:00 - 16:50"],
        postos: ["Fila do Intervalo", "Refeitório (Suco)", "Refeitório (Pratos)", "Portaria Almoço", "Pátio Central"]
    }
};

// 2. PERSISTENCE LAYER
const db = {
    save: (key, val) => localStorage.setItem(`sge_${key}`, JSON.stringify(val)),
    get: (key) => JSON.parse(localStorage.getItem(`sge_${key}`)),
    remove: (key) => localStorage.removeItem(`sge_${key}`)
};

// 3. UI HELPERS
const formatDate = (date) => date.toISOString().split('T')[0];
const showToast = (msg) => {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerText = msg;
    document.getElementById('toast-container').appendChild(t);
    setTimeout(() => t.remove(), 3000);
};

// 4. AUTH LOGIC
function handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-pass').value;
    const user = db.get(`u_${email.toLowerCase()}`);

    if (user && user.pass === pass) {
        state.user = user;
        initApp();
    } else {
        alert("Credenciais inválidas.");
    }
}

function handleSignup() {
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const user = {
        nome: document.getElementById('reg-nome').value,
        cargo: document.getElementById('reg-cargo').value,
        pass: document.getElementById('reg-pass').value
    };
    if(!email || user.pass.length < 6) return alert("Dados inválidos");
    db.save(`u_${email}`, user);
    alert("Conta criada!");
    toggleAuth('login');
}

// 5. CALENDAR CORE
function renderCalendar() {
    const container = document.getElementById('cal-days');
    const monthYear = document.getElementById('cal-month-year');
    container.innerHTML = "";

    const year = state.calendarDate.getFullYear();
    const month = state.calendarDate.getMonth();
    
    monthYear.innerText = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(state.calendarDate);

    const firstDay = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();

    // Dias vazios do mês anterior
    for (let i = 0; i < firstDay; i++) {
        container.innerHTML += `<div class="day empty"></div>`;
    }

    // Dias do mês atual
    for (let d = 1; d <= lastDay; d++) {
        const dateObj = new Date(year, month, d);
        const dateStr = formatDate(dateObj);
        const isSelected = dateStr === formatDate(state.selectedDate);
        const isToday = dateStr === formatDate(new Date());

        const dayEl = document.createElement('div');
        dayEl.className = `day ${isSelected ? 'active' : ''} ${isToday ? 'today' : ''}`;
        dayEl.innerText = d;
        dayEl.onclick = () => {
            state.selectedDate = dateObj;
            renderCalendar();
            renderSchedule();
        };
        container.appendChild(dayEl);
    }
}

function changeMonth(dir) {
    state.calendarDate.setMonth(state.calendarDate.getMonth() + dir);
    renderCalendar();
}

// 6. SCHEDULE & MONITORIA LOGIC
function renderSchedule() {
    const tbody = document.getElementById('reserva-rows');
    const dateKey = formatDate(state.selectedDate);
    document.getElementById('current-date-label').innerText = state.selectedDate.toLocaleDateString('pt-BR', { dateStyle: 'full' });
    
    tbody.innerHTML = "";

    state.config.slots.forEach((slot, i) => {
        const storageKey = `res_${state.currentLab}_${dateKey}_${i}`;
        const saved = db.get(storageKey) || { prof: "", turma: "" };
        const isLunch = slot.includes("Almoço");

        const tr = document.createElement('tr');
        if(isLunch) {
            tr.innerHTML = `<td colspan="4" style="text-align:center; background:rgba(245,158,11,0.1); font-weight:700">🍴 INTERVALO</td>`;
        } else {
            tr.innerHTML = `
                <td><strong>${slot}</strong></td>
                <td><input type="text" id="prof-${i}" value="${saved.prof}" placeholder="Nome do Professor"></td>
                <td><input type="text" id="turma-${i}" value="${saved.turma}" placeholder="Ex: DS1"></td>
                <td><button class="btn-save" onclick="saveReserva(${i})">OK</button></td>
            `;
        }
        tbody.appendChild(tr);
    });
}

function saveReserva(index) {
    const dateKey = formatDate(state.selectedDate);
    const data = {
        prof: document.getElementById(`prof-${index}`).value,
        turma: document.getElementById(`turma-${index}`).value.toUpperCase()
    };
    db.save(`res_${state.currentLab}_${dateKey}_${index}`, data);
    alert("Horário garantido!");
}

function renderMonitoria() {
    const tbody = document.getElementById('monitoria-rows');
    tbody.innerHTML = "";
    state.config.postos.forEach((posto, i) => {
        const saved = db.get(`mon_${posto}`) || { aluno: "", turma: "" };
        tbody.innerHTML += `
            <tr>
                <td><strong>${posto}</strong></td>
                <td><input type="text" id="m-aluno-${i}" value="${saved.aluno}"></td>
                <td><input type="text" id="m-turma-${i}" value="${saved.turma}"></td>
                <td><button class="btn-save" onclick="saveMonitoria('${posto}', ${i})">Salvar</button></td>
            </tr>
        `;
    });
}

function saveMonitoria(posto, i) {
    const data = {
        aluno: document.getElementById(`m-aluno-${i}`).value,
        turma: document.getElementById(`m-turma-${i}`).value.toUpperCase()
    };
    db.save(`mon_${posto}`, data);
    alert("Escala atualizada!");
}

// 7. NAVIGATION & INIT
function initApp() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('display-user-name').innerText = state.user.nome;
    document.getElementById('user-greeting').innerText = state.user.nome.split(' ')[0];
    renderCalendar();
    renderSchedule();
}

function navTo(viewId, btn) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`view-${viewId}`).classList.add('active');
    
    if(btn) {
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }
    if(viewId === 'monitoria') renderMonitoria();
}

function setLab(lab, btn) {
    state.currentLab = lab;
    document.querySelectorAll('.lab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderSchedule();
}

function toggleAuth(type) {
    document.getElementById('login-form').style.display = type === 'login' ? 'block' : 'none';
    document.getElementById('signup-form').style.display = type === 'signup' ? 'block' : 'none';
}

function toggleTheme() {
    document.body.classList.toggle('dark');
    document.getElementById('theme-icon').innerText = document.body.classList.contains('dark') ? '☀️' : '🌙';
}

function logout() { location.reload(); }