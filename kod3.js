let routines = JSON.parse(localStorage.getItem('rutinixData')) || {
    Ev: { Sabah: [], Öğle: [], Akşam: [] }, Okul: { Sabah: [], Öğle: [], Akşam: [] },
    İş: { Sabah: [], Öğle: [], Akşam: [] }, Yolculuk: { Sabah: [], Öğle: [], Akşam: [] }
};

let currentMode = 'Ev';
let currentTimeSlot = 'Sabah';
let currentPhotoIdx = null;

// Butonları ve olayları başlatan ana fonksiyon
document.addEventListener('DOMContentLoaded', () => {
    // Görev Ekleme Butonu
    const addBtn = document.getElementById('add-btn');
    if(addBtn) addBtn.addEventListener('click', addTask);

    // Vakit Sekmeleri
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentTimeSlot = e.currentTarget.dataset.slot;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            document.getElementById('view-title').innerText = `${currentTimeSlot} Rutini`;
            renderTasks();
        });
    });

    // Mod Seçimi
    document.getElementById('mode-select').onchange = (e) => {
        currentMode = e.target.value;
        renderTasks();
    };

    // Fotoğraf Alanı Tıklama
    document.getElementById('drop-trigger').onclick = () => {
        document.getElementById('photo-upload').click();
    };

    // Canlı Saat
    setInterval(() => {
        document.getElementById('live-clock').innerText = new Date().toLocaleTimeString();
    }, 1000);

    renderTasks();
});

function addTask() {
    const text = document.getElementById('task-input').value;
    const time = document.getElementById('time-input').value;
    const sound = document.getElementById('sound-select').value;
    
    if (!text || !time) return alert("Lütfen görev ve saat girin!");

    routines[currentMode][currentTimeSlot].push({ text, time, sound, completed: false, photo: null });
    document.getElementById('task-input').value = "";
    saveAndRefresh();
}

function renderTasks() {
    const grid = document.getElementById('task-grid');
    grid.innerHTML = '';
    const tasks = routines[currentMode][currentTimeSlot];

    tasks.forEach((task, index) => {
        const div = document.createElement('div');
        div.className = `task-item ${task.completed ? 'completed' : ''}`;
        div.innerHTML = `
            <div style="color: var(--accent); font-size: 13px; margin-bottom: 10px;">⏰ ${task.time}</div>
            <h3 style="margin-bottom: 20px; color:white;">${task.text}</h3>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <button class="cam-btn" style="background: transparent; border: 1px solid #2d3446; color: white; padding: 6px 12px; border-radius: 8px; cursor: pointer;">📸 Kanıt</button>
                <input type="checkbox" class="task-check" style="width: 24px; height: 24px; cursor:pointer;" ${task.completed ? 'checked' : ''}>
            </div>
            ${task.photo ? `<img src="${task.photo}" style="width: 100%; border-radius: 12px; margin-top: 15px; border: 1px solid var(--accent);">` : ''}
        `;

        // İçerideki butonlara görev atama
        div.querySelector('.task-check').addEventListener('change', () => toggleTask(index));
        div.querySelector('.cam-btn').addEventListener('click', () => {
            currentPhotoIdx = index;
            document.getElementById('photo-upload').click();
        });

        grid.appendChild(div);
    });
    updateUI();
}

function handlePhotoUpload(e) {
    const reader = new FileReader();
    reader.onload = (event) => {
        if(currentPhotoIdx !== null) {
            routines[currentMode][currentTimeSlot][currentPhotoIdx].photo = event.target.result;
            saveAndRefresh();
        }
    };
    reader.readAsDataURL(e.target.files[0]);
}

// Dosya girişi için listener
document.getElementById('photo-upload').addEventListener('change', handlePhotoUpload);

function toggleTask(idx) {
    routines[currentMode][currentTimeSlot][idx].completed = !routines[currentMode][currentTimeSlot][idx].completed;
    saveAndRefresh();
}

function updateUI() {
    const tasks = routines[currentMode][currentTimeSlot];
    const completed = tasks.filter(t => t.completed).length;
    const p = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
    
    document.getElementById('progress-text').innerText = p + '%';
    document.getElementById('progress-visual').style.background = `conic-gradient(var(--accent) ${p}%, #252b39 0%)`;
    
    const aiText = document.getElementById('ai-text');
    aiText.innerText = p > 70 ? "🤖 Harika ilerliyorsun!" : "🤖 Bugün biraz yavaşız, hadi hızlanalım.";
}

function saveAndRefresh() {
    localStorage.setItem('rutinixData', JSON.stringify(routines));
    renderTasks();
}