const state = {
    user: null,
    currentLab: "Informática",
    selectedDate: new Date(),
    calendarDate: new Date(),
    config: {
        slots: ["07:20 - 08:10", "08:10 - 09:00", "09:20 - 10:10", "10:10 - 11:00", "11:00 - 11:50", "12:00 - 13:00 (Intervalo)", "13:10 - 14:00", "14:00 - 14:50", "15:10 - 16:00", "16:00 - 16:50"],
        postos: ["Fila do Intervalo", "Refeitório (Suco)", "Refeitório (Pratos)", "Portaria Almoço", "Pátio Central"]
    }
};

const storage = {
    save: (key, val) => localStorage.setItem(`mg_sge_${key}`, JSON.stringify(val)),
    get: (key) => JSON.parse(localStorage.getItem(`mg_sge_${key}`))
};

function initApp() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'flex';
    
    const u = state.user;
    document.getElementById('display-user-name').innerText = u.nome;
    document.getElementById('display-user-cargo').innerText = u.cargo;
    document.getElementById('user-greeting').innerText = u.nome.split(' ')[0];
    
    const initials = u.nome.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
    document.getElementById('user-initials').innerText = initials;

    renderCalendar();
    renderSchedule();
}

function renderCalendar() {
    const container = document.getElementById('cal-days');
    const display = document.getElementById('cal-month-year');
    container.innerHTML = "";

    const year = state.calendarDate.getFullYear();
    const month = state.calendarDate.getMonth();
    display.innerText = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(state.calendarDate);

    const firstDay = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();

    for(let i=0; i<firstDay; i++) container.innerHTML += `<div class="day empty"></div>`;

    for(let d=1; d<=lastDay; d++) {
        const dateObj = new Date(year, month, d);
        const dateStr = dateObj.toISOString().split('T')[0];
        const isSelected = dateStr === state.selectedDate.toISOString().split('T')[0];
        
        const div = document.createElement('div');
        div.className = `day ${isSelected ? 'active' : ''}`;
        div.innerText = d;
        div.onclick = () => {
            state.selectedDate = dateObj;
            renderCalendar();
            renderSchedule();
        };
        container.appendChild(div);
    }
}

function renderSchedule() {
    const tbody = document.getElementById('reserva-rows');
    const dateKey = state.selectedDate.toISOString().split('T')[0];
    document.getElementById('current-date-label').innerText = state.selectedDate.toLocaleDateString('pt-BR', { dateStyle: 'long' });
    
    tbody.innerHTML = "";
    state.config.slots.forEach((slot, i) => {
        const key = `res_${state.currentLab}_${dateKey}_${i}`;
        const saved = storage.get(key) || { prof: "", turma: "" };
        const isInterval = slot.includes("Intervalo");

        const tr = document.createElement('tr');
        if(isInterval) {
            tr.innerHTML = `<td colspan="4" style="text-align:center; opacity:0.5; font-size:0.8rem">☕ Intervalo de Almoço</td>`;
        } else {
            tr.innerHTML = `
                <td><strong>${slot}</strong></td>
                <td><input type="text" value="${saved.prof}" onchange="saveReserva(${i}, 'prof', this.value)"></td>
                <td><input type="text" value="${saved.turma}" onchange="saveReserva(${i}, 'turma', this.value.toUpperCase())"></td>
                <td><span class="badge ${saved.prof ? 'booked' : 'free'}">${saved.prof ? 'Reservado' : 'Disponível'}</span></td>
            `;
        }
        tbody.appendChild(tr);
    });
}

function saveReserva(index, field, value) {
    const dateKey = state.selectedDate.toISOString().split('T')[0];
    const key = `res_${state.currentLab}_${dateKey}_${index}`;
    let data = storage.get(key) || { prof: "", turma: "" };
    data[field] = value;
    storage.save(key, data);
    renderSchedule();
}

function navTo(viewId, btn) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`view-${viewId}`).classList.add('active');
    
    const titles = { 'menu': 'Dashboard', 'reservas': 'Laboratórios', 'monitoria': 'Monitoria' };
    document.getElementById('page-title').innerText = titles[viewId];
    
    if(btn) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        btn.classList.add('active');
    }
    if(viewId === 'monitoria') renderMonitoria();
}

function changeMonth(dir) {
    state.calendarDate.setMonth(state.calendarDate.getMonth() + dir);
    renderCalendar();
}

function setLab(lab, btn) {
    state.currentLab = lab;
    document.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderSchedule();
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const icon = document.getElementById('theme-icon');
    icon.className = document.body.classList.contains('dark-theme') ? 'bi bi-sun' : 'bi bi-moon-stars';
}

function handleLogin() {
    const email = document.getElementById('login-email').value.toLowerCase();
    const user = storage.get(`user_${email}`);
    if(user) { state.user = user; initApp(); } 
    else { alert("Simulação: Use um e-mail cadastrado."); }
}

function handleSignup() {
    const email = document.getElementById('reg-email').value.toLowerCase();
    const user = { nome: document.getElementById('reg-nome').value, cargo: document.getElementById('reg-cargo').value, email };
    storage.save(`user_${email}`, user);
    alert("Conta criada!");
}

function toggleAuth(type) {
    document.getElementById('login-form').style.display = type === 'login' ? 'block' : 'none';
    document.getElementById('signup-form').style.display = type === 'signup' ? 'block' : 'none';
}

function logout() { location.reload(); }