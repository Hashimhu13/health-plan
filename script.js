// الخطة اليومية
const plan = [
    { time: "5:30 ص", activity: "الاستيقاظ، كوب ماء + قهوة/شاي بدون سكر" },
    { time: "5:50 ص – 6:00 م", activity: "دوام العمل (استراحات قصيرة للماء)" },
    { time: "11:30 ص", activity: "الوجبة الأولى (غداء): بروتين + خضار + قليل من الكربوهيدرات (صدر دجاج / سمك / لحم قليل الدهن + سلطة + رز قليل / بطاطس)" },
    { time: "4:00 م", activity: "سناك خفيف: فاكهة، مكسرات، أو زبادي قليل الدسم" },
    { time: "6:30 م – 7:15 م", activity: "رياضة: مشي سريع، جري، أو تمارين بيتية حسب الطاقة" },
    { time: "7:15 م – 7:30 م", activity: "وجبة ثانية (عشاء خفيف): سلطة + بروتين أو شوربة خفيفة" },
    { time: "7:30 م – 11:30 ص اليوم التالي", activity: "صيام: شرب ماء، شاي، قهوة بدون سكر" },
    { time: "9:30 – 10:00 م", activity: "النوم: الحصول على 7–8 ساعات" }
];

// تحميل الجدول اليومي
function loadPlan() {
    const tbody = document.getElementById('plan-table');
    tbody.innerHTML = '';
    plan.forEach((item, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.time}</td>
            <td>${item.activity}</td>
            <td><input type="checkbox" class="done-checkbox" data-idx="${idx}"></td>
        `;
        tbody.appendChild(tr);
    });
}

// حفظ الإنجاز في localStorage
function saveProgress() {
    const checkboxes = document.querySelectorAll('.done-checkbox');
    const today = new Date().toISOString().slice(0, 10);
    let progress = JSON.parse(localStorage.getItem('progress') || '{}');
    progress[today] = Array.from(checkboxes).map(cb => cb.checked);
    localStorage.setItem('progress', JSON.stringify(progress));
}

// تحميل الإنجاز من localStorage
function loadProgress() {
    const checkboxes = document.querySelectorAll('.done-checkbox');
    const today = new Date().toISOString().slice(0, 10);
    let progress = JSON.parse(localStorage.getItem('progress') || '{}');
    if (progress[today]) {
        checkboxes.forEach((cb, i) => {
            cb.checked = progress[today][i];
        });
    }
}

// حساب اليوم من الأسبوع (0=الأحد, 6=السبت)
function getWeekDay(dateStr) {
    // تحويل إلى تاريخ ثم إلى رقم اليوم (مع اعتبار السبت=6)
    const d = new Date(dateStr);
    let day = d.getDay();
    return day === 0 ? 7 : day; // الأحد=7 (حتى يكون السبت=6)
}

// إرجاع بداية الأسبوع (السبت) لتاريخ معين
function getWeekStart(dateStr) {
    const d = new Date(dateStr);
    let day = d.getDay();
    let diff = (day === 6 ? 0 : (day === 0 ? 6 : day - 6));
    d.setDate(d.getDate() - diff);
    return d.toISOString().slice(0, 10);
}

// تتبع الإنجاز الأسبوعي (كل أسبوع من السبت إلى الجمعة)
function showWeeklyProgress() {
    let progress = JSON.parse(localStorage.getItem('progress') || '{}');
    let allDays = Object.keys(progress).sort();
    let weeks = {};
    allDays.forEach(day => {
        let weekStart = getWeekStart(day);
        if (!weeks[weekStart]) weeks[weekStart] = [];
        weeks[weekStart].push(day);
    });
    let html = '<table><tr><th>أسبوع يبدأ</th><th>نسبة الالتزام</th></tr>';
    Object.keys(weeks).slice(-4).forEach(weekStart => {
        let days = weeks[weekStart];
        let total = 0, count = 0;
        days.forEach(day => {
            let arr = progress[day];
            if (arr) {
                total += arr.filter(Boolean).length / plan.length;
                count++;
            }
        });
        let percent = count ? Math.round(100 * total / count) : 0;
        html += `<tr><td>${weekStart}</td><td>${percent}%</td></tr>`;
    });
    html += '</table>';
    document.getElementById('weekly-progress').innerHTML = html;
}

// ملخص الالتزام اليومي
function showTodayProgress() {
    let progress = JSON.parse(localStorage.getItem('progress') || '{}');
    const today = new Date().toISOString().slice(0, 10);
    let arr = progress[today];
    let percent = arr ? Math.round(100 * arr.filter(Boolean).length / plan.length) : 0;
    document.getElementById('today-progress').innerHTML = `<strong>نسبة الالتزام اليوم: ${percent}%</strong>`;
}

// الأحداث
window.onload = function() {
    // تحميل البيانات الشخصية
    loadPersonalSummary();
    const personalSection = document.querySelector('.personal-info');
    const personalForm = document.getElementById('personal-form');
    const editBtn = document.getElementById('edit-personal-btn');
    // إخفاء القسم إذا كانت البيانات محفوظة
    let data = {};
    try { data = JSON.parse(localStorage.getItem('personal') || '{}'); } catch {}
    if (data.username) {
        personalForm.style.display = 'none';
        editBtn.style.display = 'inline-block';
    }
    editBtn.onclick = function() {
        // إعادة تعبئة النموذج بالبيانات القديمة
        if (data.username) document.getElementById('username').value = data.username;
        if (data.birthdate) document.getElementById('birthdate').value = data.birthdate;
        if (data.workStart) document.getElementById('work-start').value = data.workStart;
        if (data.workEnd) document.getElementById('work-end').value = data.workEnd;
        if (Array.isArray(data.workdays)) {
            document.querySelectorAll('input[name="workdays"]').forEach(cb => {
                cb.checked = data.workdays.includes(cb.value);
            });
        }
        personalForm.style.display = 'block';
        editBtn.style.display = 'none';
    };
    personalForm.onsubmit = function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const birthdate = document.getElementById('birthdate').value;
        const workStart = document.getElementById('work-start').value;
        const workEnd = document.getElementById('work-end').value;
        const workdays = Array.from(document.querySelectorAll('input[name="workdays"]:checked')).map(cb => cb.value);
        const data = { username, birthdate, workStart, workEnd, workdays };
        localStorage.setItem('personal', JSON.stringify(data));
        loadPersonalSummary();
        personalForm.style.display = 'none';
        editBtn.style.display = 'inline-block';
        return false;
    };
    loadPlan();
    loadProgress();
    showWeeklyProgress();
    showTodayProgress();
    document.querySelectorAll('.done-checkbox').forEach(cb => {
        cb.addEventListener('change', () => {
            saveProgress();
            showWeeklyProgress();
            showTodayProgress();
        });
    });
    // سجل الوزن والملاحظات
    loadLogHistory();
    document.getElementById('log-form').onsubmit = function(e) {
        e.preventDefault();
        const weight = document.getElementById('weight').value;
        const note = document.getElementById('note').value;
        const today = new Date().toISOString().slice(0, 10);
        let logs = JSON.parse(localStorage.getItem('logs') || '{}');
        logs[today] = { weight, note };
        localStorage.setItem('logs', JSON.stringify(logs));
        loadLogHistory();
        this.reset();
    };
};

// حساب العمر من تاريخ الميلاد
function calcAge(birthdate) {
    if (!birthdate) return '';
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

// عرض ملخص البيانات الشخصية
function loadPersonalSummary() {
    const summaryDiv = document.getElementById('personal-summary');
    let data = {};
    try { data = JSON.parse(localStorage.getItem('personal') || '{}'); } catch {}
    if (data.username) {
        const age = calcAge(data.birthdate);
        summaryDiv.innerHTML = `<strong>مرحباً ${data.username}!</strong><br>
            العمر: ${age ? age + ' سنة' : ''}<br>
            أوقات الدوام: ${data.workStart || ''} – ${data.workEnd || ''}<br>
            أيام العمل: ${(data.workdays || []).join('، ')}`;
    } else {
        summaryDiv.innerHTML = '';
    }
}

// عرض سجل الوزن والملاحظات
function loadLogHistory() {
    let logs = JSON.parse(localStorage.getItem('logs') || '{}');
    let days = Object.keys(logs).slice(-7).reverse();
    let html = '<table><tr><th>اليوم</th><th>الوزن</th><th>ملاحظة</th></tr>';
    days.forEach(day => {
        html += `<tr><td>${day}</td><td>${logs[day].weight || ''}</td><td>${logs[day].note || ''}</td></tr>`;
    });
    html += '</table>';
    document.getElementById('log-history').innerHTML = html;
}
