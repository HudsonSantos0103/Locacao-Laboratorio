const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
let date = new Date();

function handleLogin() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('sys-header').style.display = 'flex';
    document.getElementById('app-content').style.display = 'block';
    initCalendarSelects();
}

function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    if(id === 'menu') document.getElementById('main-menu').classList.add('active');
    else document.getElementById(`sec-${id}`).classList.add('active');
    
    if(id === 'calendario') renderCalendar();
}

function toggleDarkMode() {
    document.body.classList.toggle('dark');
}

function initCalendarSelects() {
    const mSel = document.getElementById('cal-month');
    const ySel = document.getElementById('cal-year');
    
    months.forEach((m, i) => mSel.innerHTML += `<option value="${i}">${m}</option>`);
    for(let y = 2024; y <= 2030; y++) ySel.innerHTML += `<option value="${y}">${y}</option>`;
    
    mSel.value = date.getMonth();
    ySel.value = date.getFullYear();
}

function renderCalendar() {
    const month = parseInt(document.getElementById('cal-month').value);
    const year = parseInt(document.getElementById('cal-year').value);
    
    // Configurações de data
    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();
    
    // Renderizar Mini Calendário
    const miniGrid = document.getElementById('mini-grid-container');
    document.getElementById('mini-month-label').innerText = months[month];
    miniGrid.innerHTML = "";
    
    for(let i = 0; i < firstDayIndex; i++) miniGrid.innerHTML += `<div></div>`;
    for(let i = 1; i <= lastDay; i++) {
        miniGrid.innerHTML += `<div class="mini-day">${i}</div>`;
    }

    // Renderizar Calendário Principal
    const mainGrid = document.getElementById('main-calendar-days');
    mainGrid.innerHTML = "";

    for(let i = 0; i < firstDayIndex; i++) mainGrid.innerHTML += `<div></div>`;
    
    for(let i = 1; i <= lastDay; i++) {
        // Exemplo de lógica de ocupação
        const isBusy = i % 5 === 0; // Simulação: a cada 5 dias está ocupado
        
        mainGrid.innerHTML += `
            <div class="day-card" onclick="showSection('reservas')">
                <span class="day-num">${i}</span>
                <div class="status-tag ${isBusy ? 'busy' : 'free'}">
                    ${isBusy ? 'Ocupado' : 'Disponível'}
                </div>
            </div>
        `;
    }
}