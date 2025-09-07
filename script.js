
// إدارة الجدول اليومي (إضافة/تعديل/حذف)
function getPlan() {
    let plan = [];
    try { plan = JSON.parse(localStorage.getItem('plan') || '[]'); } catch {}
    return plan;
}
function savePlan(plan) {
    localStorage.setItem('plan', JSON.stringify(plan));
}
function calcDuration(start, end) {
    if (!start || !end) return '';
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins < 0) mins += 24 * 60;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return (h ? h + 'س ' : '') + (m ? m + 'د' : (h ? '' : '0د'));
}

function loadPlan() {
    const plan = getPlan();
    let html = '<table><thead><tr><th>النشاط</th><th>من</th><th>إلى</th><th>المدة</th><th>تم الإنجاز؟</th><th>تعديل</th><th>حذف</th></tr></thead><tbody>';
    plan.forEach((item, idx) => {
        html += `<tr>
            <td><span class="plan-activity" data-idx="${idx}">${item.activity}</span></td>
            <td>${item.start || ''}</td>
            <td>${item.end || ''}</td>
            <td>${calcDuration(item.start, item.end)}</td>
            <td><input type="checkbox" class="done-checkbox" data-idx="${idx}"></td>
            <td><button class="edit-plan-btn" data-idx="${idx}">تعديل</button></td>
            <td><button class="delete-plan-btn" data-idx="${idx}">حذف</button></td>
        </tr>`;
    });
    html += '</tbody></table>';
    document.getElementById('plan-table-wrap').innerHTML = html;
    // إعادة تفعيل الأحداث
    document.querySelectorAll('.delete-plan-btn').forEach(btn => {
        btn.onclick = function() {
            let plan = getPlan();
            plan.splice(+this.dataset.idx, 1);
            savePlan(plan);
            loadPlan();
            loadProgress();
            showTodayProgress();
        };
    });
    document.querySelectorAll('.edit-plan-btn').forEach(btn => {
        btn.onclick = function() {
            let plan = getPlan();
            const idx = +this.dataset.idx;
            document.getElementById('plan-activity').value = plan[idx].activity;
            document.getElementById('plan-start').value = plan[idx].start || '';
            document.getElementById('plan-end').value = plan[idx].end || '';
            document.getElementById('plan-form').dataset.editIdx = idx;
        };
    });
    // إعادة تفعيل checkboxes
    loadProgress();
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
    let plan = getPlan();
    let html = '<table><tr><th>أسبوع يبدأ</th><th>نسبة الالتزام</th></tr>';
    Object.keys(weeks).slice(-4).forEach(weekStart => {
        let days = weeks[weekStart];
        let total = 0, count = 0;
        days.forEach(day => {
            let arr = progress[day];
            if (arr && plan.length) {
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
    let plan = getPlan();
    let percent = (arr && plan.length) ? Math.round(100 * arr.filter(Boolean).length / plan.length) : 0;
    document.getElementById('today-progress').innerHTML = `<strong>نسبة الالتزام اليوم: ${percent}%</strong>`;
}

// الأحداث
window.onload = function() {
    // دمج قائمة أطعمة افتراضية مع أي أطعمة موجودة بدون تكرار
    const defaultFoods = [
    { name: 'شيبس صغير', calories: 160, unit: 'كيس', unitAmount: 1 },
    { name: 'شيبس كبير', calories: 300, unit: 'كيس', unitAmount: 1 },
    { name: 'فشار', calories: 90, unit: 'كوب', unitAmount: 1 },
    { name: 'كتكات', calories: 210, unit: 'قطعة', unitAmount: 1 },
    { name: 'مارس', calories: 230, unit: 'قطعة', unitAmount: 1 },
    { name: 'سنيكرز', calories: 250, unit: 'قطعة', unitAmount: 1 },
    { name: 'بسكويت دايجستف', calories: 70, unit: 'قطعة', unitAmount: 1 },
    { name: 'بسكويت اوريو', calories: 53, unit: 'قطعة', unitAmount: 1 },
    { name: 'شوكولاتة جالكسي', calories: 220, unit: 'قطعة', unitAmount: 1 },
    { name: 'عصير برتقال', calories: 110, unit: 'كوب', unitAmount: 1 },
    { name: 'عصير تفاح', calories: 120, unit: 'كوب', unitAmount: 1 },
    { name: 'زبادي قليل الدسم', calories: 60, unit: 'علبة', unitAmount: 1 },
    { name: 'لبن قليل الدسم', calories: 80, unit: 'كوب', unitAmount: 1 },
        { name: 'كبسة دجاج', calories: 500, unit: 'جم', unitAmount: 250 },
        { name: 'مندي لحم', calories: 600, unit: 'جم', unitAmount: 250 },
        { name: 'مجبوس دجاج', calories: 520, unit: 'جم', unitAmount: 250 },
        { name: 'برياني', calories: 550, unit: 'جم', unitAmount: 250 },
        { name: 'رز أبيض مطبوخ', calories: 130, unit: 'جم', unitAmount: 100 },
        { name: 'جريش', calories: 350, unit: 'جم', unitAmount: 200 },
        { name: 'قرصان', calories: 360, unit: 'جم', unitAmount: 200 },
        { name: 'مطازيز', calories: 370, unit: 'جم', unitAmount: 200 },
        { name: 'هريس', calories: 330, unit: 'جم', unitAmount: 200 },
        { name: 'ثريد', calories: 400, unit: 'جم', unitAmount: 250 },
        { name: 'لقيمات', calories: 400, unit: 'جم', unitAmount: 100 },
        { name: 'سمبوسة', calories: 120, unit: 'جم', unitAmount: 1 },
        { name: 'فول', calories: 110, unit: 'جم', unitAmount: 100 },
        { name: 'حمص', calories: 160, unit: 'جم', unitAmount: 100 },
        { name: 'تمر', calories: 280, unit: 'جم', unitAmount: 100 },
        { name: 'شوربة عدس', calories: 180, unit: 'جم', unitAmount: 250 },
        { name: 'شوربة دجاج', calories: 150, unit: 'جم', unitAmount: 250 },
        { name: 'سلطة خضراء', calories: 80, unit: 'جم', unitAmount: 150 },
        { name: 'قهوة عربية', calories: 5, unit: 'كوب', unitAmount: 1 },
        { name: 'شاورما دجاج', calories: 500, unit: 'سندويتش', unitAmount: 1 },
        { name: 'شاورما لحم', calories: 600, unit: 'سندويتش', unitAmount: 1 },
        { name: 'كباب لحم', calories: 250, unit: 'جم', unitAmount: 100 },
        { name: 'كباب دجاج', calories: 200, unit: 'جم', unitAmount: 100 },
        { name: 'مشاوي مشكلة', calories: 550, unit: 'جم', unitAmount: 250 },
        { name: 'برجر لحم', calories: 700, unit: 'وجبة', unitAmount: 1 },
        { name: 'برجر دجاج', calories: 600, unit: 'وجبة', unitAmount: 1 },
        { name: 'بيتزا وسط', calories: 280, unit: 'قطعة', unitAmount: 1 },
        { name: 'بروستد دجاج', calories: 800, unit: 'وجبة (4 قطع)', unitAmount: 1 },
        { name: 'فلافل', calories: 330, unit: 'جم', unitAmount: 100 }
    ];
    let foods = [];
    try { foods = JSON.parse(localStorage.getItem('foods') || '[]'); } catch {}
    defaultFoods.forEach(df => {
        if (!foods.some(f => f.name === df.name)) foods.push(df);
    });
    localStorage.setItem('foods', JSON.stringify(foods));
    // تفعيل التنقل الجانبي
    function showSection(section) {
        document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
        document.getElementById('section-' + section).classList.add('active');
        document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('active'));
        document.querySelector('.sidebar-link[data-section="' + section + '"]').classList.add('active');
    }
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showSection(this.dataset.section);
            if (this.dataset.section === 'home') updateHomeSummary();
        });
    });
    // إظهار الصفحة الرئيسية افتراضياً
    showSection('home');

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
    // إضافة/تعديل نشاط في الجدول اليومي
    document.getElementById('plan-form').onsubmit = function(e) {
        e.preventDefault();
        let plan = getPlan();
        const activity = document.getElementById('plan-activity').value.trim();
        const start = document.getElementById('plan-start').value;
        const end = document.getElementById('plan-end').value;
        const editIdx = this.dataset.editIdx;
        if (editIdx !== undefined && editIdx !== "") {
            plan[+editIdx] = { activity, start, end };
            this.dataset.editIdx = "";
        } else {
            plan.push({ activity, start, end });
        }
        savePlan(plan);
        loadPlan();
        this.reset();
    };
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

    // إدارة أنواع الطعام
    loadFoodTypes();
    updateFoodTypeSelect();
    document.getElementById('food-form').onsubmit = function(e) {
        e.preventDefault();
        const name = document.getElementById('new-food-name').value.trim();
        const calories = parseInt(document.getElementById('new-food-calories').value) || 0;
        const unit = document.getElementById('new-food-unit').value.trim() || 'جم';
        if (!name || !calories) return;
        let foods = JSON.parse(localStorage.getItem('foods') || '[]');
        // منع التكرار
        if (foods.some(f => f.name === name)) return;
        foods.push({ name, calories, unit });
        localStorage.setItem('foods', JSON.stringify(foods));
        loadFoodTypes();
        updateFoodTypeSelect();
        // تحديث الوحدة والسعرات في النموذج
        document.getElementById('food-type').value = name;
        updateFoodUnit();
        updateMealCalories();
        this.reset();
    };

    // تحديث الوحدة عند تغيير نوع الطعام
    document.getElementById('food-type').addEventListener('change', function() {
        updateFoodUnit();
        updateMealCalories();
    });
    document.getElementById('food-amount').addEventListener('input', updateMealCalories);

    // تحديث السعرات تلقائياً عند تغيير الكمية أو نوع الطعام
    function updateMealCalories() {
        const foodType = document.getElementById('food-type').value;
        const amount = parseFloat(document.getElementById('food-amount').value) || 0;
        let foods = JSON.parse(localStorage.getItem('foods') || '[]');
        let food = foods.find(f => f.name === foodType);
        if (food) {
            let cal = Math.round((food.calories * amount) / 100);
            document.getElementById('meal-calories').value = cal;
        } else {
            document.getElementById('meal-calories').value = '';
        }
    }

    function updateFoodUnit() {
        const foodType = document.getElementById('food-type').value;
        let foods = JSON.parse(localStorage.getItem('foods') || '[]');
        let food = foods.find(f => f.name === foodType);
        document.getElementById('food-unit').textContent = food ? food.unit : '';
    }

    // تعبئة قائمة أنواع الطعام
    function updateFoodTypeSelect() {
        let foods = JSON.parse(localStorage.getItem('foods') || '[]');
        const select = document.getElementById('food-type');
        select.innerHTML = '';
        foods.forEach(f => {
            let opt = document.createElement('option');
            opt.value = f.name;
            opt.textContent = f.name;
            select.appendChild(opt);
        });
        // تحديد أول عنصر تلقائياً إذا كان موجوداً
        if (foods.length > 0) {
            select.value = foods[0].name;
        }
        updateFoodUnit();
        updateMealCalories();
    }

    // عرض أنواع الطعام
    function loadFoodTypes() {
        let foods = JSON.parse(localStorage.getItem('foods') || '[]');
        let html = '<table><tr><th>الطعام</th><th>سعرات لكل 100</th><th>الوحدة</th></tr>';
        foods.forEach(f => {
            html += `<tr><td>${f.name}</td><td>${f.calories}</td><td>${f.unit}</td></tr>`;
        });
        html += '</table>';
        document.getElementById('food-list').innerHTML = html;
    }

    // تسجيل الوجبات اليومية والسعرات
    loadMeals();
    document.getElementById('meal-form').onsubmit = function(e) {
        e.preventDefault();
        const mealName = document.getElementById('meal-name').value;
        const foodType = document.getElementById('food-type').value;
        const amount = parseFloat(document.getElementById('food-amount').value) || 0;
        const mealCalories = parseInt(document.getElementById('meal-calories').value) || 0;
        const today = new Date().toISOString().slice(0, 10);
        let meals = JSON.parse(localStorage.getItem('meals') || '{}');
        if (!meals[today]) meals[today] = [];
        // تعديل إذا كان editIdx موجود
        const editIdx = this.dataset.editIdx;
        if (editIdx !== undefined && editIdx !== "") {
            meals[today][editIdx] = { meal: mealName, food: foodType, amount, calories: mealCalories };
            delete this.dataset.editIdx;
        } else {
            meals[today].push({ meal: mealName, food: foodType, amount, calories: mealCalories });
        }
        localStorage.setItem('meals', JSON.stringify(meals));
        loadMeals();
        this.reset();
    };
    // تحديث ملخص الصفحة الرئيسية
    updateHomeSummary();
};

// ملخص الصفحة الرئيسية: سجل اليوم والسعرات
function updateHomeSummary() {
    // تحية بالاسم
    let personal = {};
    try { personal = JSON.parse(localStorage.getItem('personal') || '{}'); } catch {}
    let greeting = personal.username ? `مرحباً ${personal.username} 👋` : 'مرحباً بك!';
    document.getElementById('home-greeting').textContent = greeting;

    // عبارات تحفيزية متغيرة يومياً
    const motivations = [
        'كل يوم جديد فرصة جديدة للتقدم! 💪',
        'تذكر أن الصحة كنز، استمر!',
        'خطوة صغيرة اليوم أفضل من لا شيء.',
        'اجعل العادات الصحية أسلوب حياة.',
        'أنت أقوى مما تعتقد!',
        'استمر في السعي نحو أهدافك.',
        'كل إنجاز يبدأ بخطوة.'
    ];
    const dayIdx = new Date().getDay();
    document.getElementById('home-motivation').textContent = motivations[dayIdx % motivations.length];

    // سجل اليوم
    let progress = JSON.parse(localStorage.getItem('progress') || '{}');
    const today = new Date().toISOString().slice(0, 10);
    let arr = progress[today];
    let plan = getPlan();
    let percent = (arr && plan.length) ? Math.round(100 * arr.filter(Boolean).length / plan.length) : 0;
    // السعرات
    let meals = JSON.parse(localStorage.getItem('meals') || '{}');
    let todayMeals = meals[today] || [];
    let total = todayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
    let html = `<div style=\"font-size:1.2rem;margin-bottom:10px;\"><strong>نسبة الالتزام اليوم: ${percent}%</strong></div>`;
    html += `<div style=\"font-size:1.2rem;\"><strong>مجموع السعرات اليوم: ${total} كالوري</strong></div>`;
    document.getElementById('home-summary').innerHTML = html;

    // رسم التشارت الدائري
    let targetCalories = 2000;
    if (personal.targetCalories) targetCalories = parseInt(personal.targetCalories);
    let calPercent = Math.min(Math.round((total / targetCalories) * 100), 100);
    let ctx = document.getElementById('home-circle-chart').getContext('2d');
    if (window.homeChart) window.homeChart.destroy();
    window.homeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['نسبة الالتزام', 'السعرات المستهلكة من الهدف'],
            datasets: [
                {
                    label: 'نسبة الالتزام',
                    data: [percent, 100 - percent],
                    backgroundColor: ['#1976d2', '#e3f2fd'],
                    borderWidth: 2,
                    cutout: '60%',
                    radius: '75%'
                },
                {
                    label: 'السعرات',
                    data: [calPercent, 100 - calPercent],
                    backgroundColor: ['#ff9800', '#ffe0b2'],
                    borderWidth: 2,
                    cutout: '0%',
                    radius: '59%'
                }
            ]
        },
        options: {
            plugins: {
                legend: { display: true, position: 'bottom' },
                tooltip: { enabled: true }
            }
        }
    });

    // جدول تتبع الخطة الصحية اليومية
    let table = '<table><thead><tr><th>الوقت</th><th>النشاط</th><th>تم الإنجاز؟</th></tr></thead><tbody>';
    plan.forEach((item, idx) => {
        let checked = (arr && arr[idx]) ? 'checked' : '';
        table += `<tr><td>${item.time}</td><td>${item.activity}</td><td><input type='checkbox' disabled ${checked}></td></tr>`;
    });
    table += '</tbody></table>';
    document.getElementById('home-plan-table').innerHTML = table;
}

// عرض الوجبات اليومية والسعرات
function loadMeals() {
    let meals = JSON.parse(localStorage.getItem('meals') || '{}');
    const today = new Date().toISOString().slice(0, 10);
    let todayMeals = meals[today] || [];
    let html = '<table><tr><th>الوجبة</th><th>نوع الطعام</th><th>الكمية</th><th>السعرات</th><th>تعديل</th><th>حذف</th></tr>';
    let total = 0;
    todayMeals.forEach((m, idx) => {
        html += `<tr>
            <td>${m.meal}</td>
            <td>${m.food}</td>
            <td>${m.amount}</td>
            <td>${m.calories}</td>
            <td><button class="edit-meal-btn" data-idx="${idx}">تعديل</button></td>
            <td><button class="delete-meal-btn" data-idx="${idx}">حذف</button></td>
        </tr>`;
        total += m.calories;
    });
    html += '</table>';
    document.getElementById('meals-list').innerHTML = html;
    document.getElementById('meals-total').innerHTML = `مجموع السعرات اليوم: ${total} كالوري`;
    // تفعيل أزرار الحذف
    document.querySelectorAll('.delete-meal-btn').forEach(btn => {
        btn.onclick = function() {
            let meals = JSON.parse(localStorage.getItem('meals') || '{}');
            const today = new Date().toISOString().slice(0, 10);
            if (meals[today]) {
                meals[today].splice(+this.dataset.idx, 1);
                localStorage.setItem('meals', JSON.stringify(meals));
                loadMeals();
            }
        };
    });
    // تفعيل أزرار التعديل
    document.querySelectorAll('.edit-meal-btn').forEach(btn => {
        btn.onclick = function() {
            let meals = JSON.parse(localStorage.getItem('meals') || '{}');
            const today = new Date().toISOString().slice(0, 10);
            const idx = +this.dataset.idx;
            if (meals[today] && meals[today][idx]) {
                const m = meals[today][idx];
                document.getElementById('meal-name').value = m.meal;
                document.getElementById('food-type').value = m.food;
                document.getElementById('food-amount').value = m.amount;
                document.getElementById('meal-calories').value = m.calories;
                document.getElementById('meal-form').dataset.editIdx = idx;
            }
        };
    });
}

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
