// متغيرات عامة
let currentWeek = 1;
let completedDays = JSON.parse(localStorage.getItem('completedDays')) || {};
let weightHistory = JSON.parse(localStorage.getItem('weightHistory')) || [];
let notesHistory = JSON.parse(localStorage.getItem('notesHistory')) || [];
let selectedFoods = [];

// تحميل البيانات عند بدء التطبيق
document.addEventListener('DOMContentLoaded', function() {
    loadWeekPlan();
    updateProgress();
    loadWeightHistory();
    loadNotesHistory();
    setCurrentDate();
    
    // تسجيل Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
        .then(function(registration) {
            console.log('Service Worker تم تسجيله بنجاح:', registration.scope);
        })
        .catch(function(error) {
            console.log('فشل في تسجيل Service Worker:', error);
        });
    }
});

// التنقل بين التبويبات
function showTab(tabName) {
    // إخفاء جميع التبويبات
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // إخفاء جميع أزرار التبويب
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // إظهار التبويب المحدد
    document.getElementById(tabName).classList.add('active');
    
    // تفعيل الزر المناسب
    const clickedButton = event ? event.target : document.querySelector(`[onclick="showTab('${tabName}')"]`);
    if (clickedButton) {
        clickedButton.classList.add('active');
    }
    
    // إذا كان التبويب هو حاسبة السعرات، تحديث العرض
    if (tabName === 'calculator') {
        updateSelectedFoods();
    }
}

// تحميل خطة الأسبوع
function loadWeekPlan() {
    const weekSelect = document.getElementById('weekSelect');
    const selectedWeek = parseInt(weekSelect.value);
    currentWeek = selectedWeek;
    
    const weekPlanDiv = document.getElementById('weekPlan');
    weekPlanDiv.innerHTML = '';
    
    const weekData = weightLossPlan[selectedWeek];
    
    weekDays.forEach(day => {
        const dayData = weekData[day];
        const dayKey = `week${selectedWeek}_${day}`;
        const isCompleted = completedDays[dayKey] || false;
        
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';
        dayCard.innerHTML = `
            <div class="day-header">
                <h3 class="day-name">${day}</h3>
                <input type="checkbox" class="completion-checkbox" 
                       ${isCompleted ? 'checked' : ''} 
                       onchange="toggleDayCompletion('${dayKey}')">
            </div>
            
            <div class="meals-grid">
                <div class="meal">
                    <h4><i class="fas fa-sun"></i> الفطور</h4>
                    <div class="meal-content">${dayData.breakfast}</div>
                </div>
                <div class="meal">
                    <h4><i class="fas fa-utensils"></i> الغداء</h4>
                    <div class="meal-content">${dayData.lunch}</div>
                </div>
                <div class="meal">
                    <h4><i class="fas fa-moon"></i> العشاء</h4>
                    <div class="meal-content">${dayData.dinner}</div>
                </div>
            </div>
            
            <div class="exercise-info">
                <h4><i class="fas fa-dumbbell"></i> النشاط الرياضي</h4>
                <p>${dayData.exercise}</p>
            </div>
        `;
        
        weekPlanDiv.appendChild(dayCard);
    });
}

// تبديل حالة اكتمال اليوم
function toggleDayCompletion(dayKey) {
    completedDays[dayKey] = !completedDays[dayKey];
    localStorage.setItem('completedDays', JSON.stringify(completedDays));
    updateProgress();
}

// تحديث إحصائيات التقدم
function updateProgress() {
    const totalDays = Object.keys(completedDays).filter(key => completedDays[key]).length;
    const exerciseDays = calculateExerciseDays();
    const avgCalories = calculateAverageCalories();
    const weightChange = calculateWeightChange();
    
    document.getElementById('completedDays').textContent = totalDays;
    document.getElementById('avgCalories').textContent = avgCalories;
    document.getElementById('exerciseDays').textContent = exerciseDays;
    document.getElementById('weightChange').textContent = weightChange + ' كجم';
}

// حساب أيام الرياضة
function calculateExerciseDays() {
    let exerciseDays = 0;
    Object.keys(completedDays).forEach(dayKey => {
        if (completedDays[dayKey]) {
            exerciseDays++;
        }
    });
    return exerciseDays;
}

// حساب متوسط السعرات
function calculateAverageCalories() {
    // هذه دالة تقريبية - يمكن تطويرها أكثر
    const completedDaysCount = Object.keys(completedDays).filter(key => completedDays[key]).length;
    if (completedDaysCount === 0) return 0;
    
    // متوسط تقديري للسعرات اليومية حسب الخطة
    const estimatedDailyCalories = 1200;
    return estimatedDailyCalories;
}

// حساب تغيير الوزن
function calculateWeightChange() {
    if (weightHistory.length < 2) return 0;
    
    const firstWeight = weightHistory[0].weight;
    const lastWeight = weightHistory[weightHistory.length - 1].weight;
    return (lastWeight - firstWeight).toFixed(1);
}

// إضافة وزن جديد
function addWeight() {
    const dateInput = document.getElementById('weightDate');
    const weightInput = document.getElementById('weightValue');
    
    if (!dateInput.value || !weightInput.value) {
        alert('يرجى ملء جميع الحقول');
        return;
    }
    
    const newWeight = {
        date: dateInput.value,
        weight: parseFloat(weightInput.value),
        id: Date.now()
    };
    
    weightHistory.push(newWeight);
    weightHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    localStorage.setItem('weightHistory', JSON.stringify(weightHistory));
    loadWeightHistory();
    updateProgress();
    
    // تنظيف الحقول
    dateInput.value = '';
    weightInput.value = '';
}

// تحميل تاريخ الأوزان
function loadWeightHistory() {
    const weightList = document.getElementById('weightList');
    weightList.innerHTML = '';
    
    if (weightHistory.length === 0) {
        weightList.innerHTML = '<p>لا توجد أوزان مسجلة بعد</p>';
        return;
    }
    
    weightHistory.forEach(entry => {
        const weightItem = document.createElement('div');
        weightItem.className = 'weight-item';
        weightItem.innerHTML = `
            <div>
                <strong>${entry.date}</strong>
                <span>${entry.weight} كجم</span>
            </div>
            <button class="delete-btn" onclick="deleteWeight(${entry.id})">حذف</button>
        `;
        weightList.appendChild(weightItem);
    });
}

// حذف وزن
function deleteWeight(id) {
    weightHistory = weightHistory.filter(entry => entry.id !== id);
    localStorage.setItem('weightHistory', JSON.stringify(weightHistory));
    loadWeightHistory();
    updateProgress();
}

// إضافة ملاحظة جديدة
function addNote() {
    const dateInput = document.getElementById('noteDate');
    const textInput = document.getElementById('noteText');
    
    if (!dateInput.value || !textInput.value.trim()) {
        alert('يرجى ملء جميع الحقول');
        return;
    }
    
    const newNote = {
        date: dateInput.value,
        text: textInput.value.trim(),
        id: Date.now()
    };
    
    notesHistory.push(newNote);
    notesHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    localStorage.setItem('notesHistory', JSON.stringify(notesHistory));
    loadNotesHistory();
    
    // تنظيف الحقول
    dateInput.value = '';
    textInput.value = '';
}

// تحميل تاريخ الملاحظات
function loadNotesHistory() {
    const notesList = document.getElementById('notesList');
    notesList.innerHTML = '';
    
    if (notesHistory.length === 0) {
        notesList.innerHTML = '<p>لا توجد ملاحظات مسجلة بعد</p>';
        return;
    }
    
    notesHistory.forEach(note => {
        const noteItem = document.createElement('div');
        noteItem.className = 'note-item';
        noteItem.innerHTML = `
            <div>
                <strong>${note.date}</strong>
                <button class="delete-btn" onclick="deleteNote(${note.id})">حذف</button>
            </div>
            <div class="note-text">${note.text}</div>
        `;
        notesList.appendChild(noteItem);
    });
}

// حذف ملاحظة
function deleteNote(id) {
    notesHistory = notesHistory.filter(note => note.id !== id);
    localStorage.setItem('notesHistory', JSON.stringify(notesHistory));
    loadNotesHistory();
}

// تعيين التاريخ الحالي
function setCurrentDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('weightDate').value = today;
    document.getElementById('noteDate').value = today;
}

// حاسبة السعرات الحرارية
const foodSearchInput = document.getElementById('foodSearch');
const foodResults = document.getElementById('foodResults');
const selectedFoodsDiv = document.getElementById('selectedFoods');
const totalCaloriesSpan = document.getElementById('totalCalories');

// البحث عن الطعام
if (foodSearchInput) {
    foodSearchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        
        if (searchTerm.length < 2) {
            foodResults.innerHTML = '';
            return;
        }
        
        const results = Object.keys(calorieDatabase).filter(food => 
            food.toLowerCase().includes(searchTerm)
        );
        
        foodResults.innerHTML = '';
        results.forEach(food => {
            const foodItem = document.createElement('div');
            foodItem.className = 'food-item';
            foodItem.innerHTML = `
                <span>${food} - ${calorieDatabase[food]} سعرة حرارية/100جم</span>
            `;
            foodItem.addEventListener('click', () => addFoodToMeal(food));
            foodResults.appendChild(foodItem);
        });
    });
}

// إضافة طعام للوجبة
function addFoodToMeal(foodName) {
    const existingFood = selectedFoods.find(f => f.name === foodName);
    
    if (existingFood) {
        existingFood.quantity += 100;
    } else {
        selectedFoods.push({
            name: foodName,
            calories: calorieDatabase[foodName],
            quantity: 100,
            id: Date.now()
        });
    }
    
    updateSelectedFoods();
    foodSearchInput.value = '';
    foodResults.innerHTML = '';
}

// تحديث قائمة الأطعمة المحددة
function updateSelectedFoods() {
    if (!selectedFoodsDiv) return;
    
    selectedFoodsDiv.innerHTML = '';
    
    if (selectedFoods.length === 0) {
        selectedFoodsDiv.innerHTML = '<p>لم يتم اختيار أي طعام بعد</p>';
        updateTotalCalories();
        return;
    }
    
    selectedFoods.forEach(food => {
        const foodItem = document.createElement('div');
        foodItem.className = 'selected-food-item';
        foodItem.innerHTML = `
            <span>${food.name}</span>
            <div class="food-quantity">
                <input type="number" value="${food.quantity}" 
                       onchange="updateFoodQuantity(${food.id}, this.value)"
                       min="1" step="10">
                <span>جم</span>
                <span>${Math.round((food.calories * food.quantity) / 100)} سعرة</span>
                <button class="delete-btn" onclick="removeFoodFromMeal(${food.id})">حذف</button>
            </div>
        `;
        selectedFoodsDiv.appendChild(foodItem);
    });
    
    updateTotalCalories();
}

// تحديث كمية الطعام
function updateFoodQuantity(foodId, newQuantity) {
    const food = selectedFoods.find(f => f.id === foodId);
    if (food) {
        food.quantity = Math.max(1, parseInt(newQuantity) || 1);
        updateSelectedFoods();
    }
}

// إزالة طعام من الوجبة
function removeFoodFromMeal(foodId) {
    selectedFoods = selectedFoods.filter(f => f.id !== foodId);
    updateSelectedFoods();
}

// تحديث إجمالي السعرات
function updateTotalCalories() {
    if (!totalCaloriesSpan) return;
    
    const total = selectedFoods.reduce((sum, food) => {
        return sum + Math.round((food.calories * food.quantity) / 100);
    }, 0);
    
    totalCaloriesSpan.textContent = total;
}

// إضافة مستمع للأحداث لتحديث الخطة عند تغيير الأسبوع
document.addEventListener('DOMContentLoaded', function() {
    const weekSelect = document.getElementById('weekSelect');
    if (weekSelect) {
        weekSelect.addEventListener('change', loadWeekPlan);
    }
});

// وظيفة لإعادة تعيين جميع البيانات
function resetAllData() {
    if (confirm('هل أنت متأكد من رغبتك في حذف جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.')) {
        localStorage.clear();
        completedDays = {};
        weightHistory = [];
        notesHistory = [];
        selectedFoods = [];
        
        loadWeekPlan();
        updateProgress();
        loadWeightHistory();
        loadNotesHistory();
        updateSelectedFoods();
        
        alert('تم حذف جميع البيانات بنجاح');
    }
}

// إضافة زر إعادة التعيين (يمكن إضافته للواجهة لاحقاً)
function addResetButton() {
    const resetBtn = document.createElement('button');
    resetBtn.innerHTML = '<i class="fas fa-trash"></i> إعادة تعيين البيانات';
    resetBtn.className = 'tab-btn';
    resetBtn.style.background = '#dc3545';
    resetBtn.style.color = 'white';
    resetBtn.onclick = resetAllData;
    
    document.querySelector('.tabs').appendChild(resetBtn);
}

// إضافة وظائف مساعدة إضافية
function exportData() {
    const data = {
        completedDays: completedDays,
        weightHistory: weightHistory,
        notesHistory: notesHistory,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'weight-loss-tracker-data.json';
    link.click();
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (confirm('هل تريد استبدال البيانات الحالية بالبيانات المستوردة؟')) {
                completedDays = data.completedDays || {};
                weightHistory = data.weightHistory || [];
                notesHistory = data.notesHistory || [];
                
                localStorage.setItem('completedDays', JSON.stringify(completedDays));
                localStorage.setItem('weightHistory', JSON.stringify(weightHistory));
                localStorage.setItem('notesHistory', JSON.stringify(notesHistory));
                
                loadWeekPlan();
                updateProgress();
                loadWeightHistory();
                loadNotesHistory();
                
                alert('تم استيراد البيانات بنجاح!');
            }
        } catch (error) {
            alert('خطأ في قراءة الملف. تأكد من أن الملف صحيح.');
        }
    };
    reader.readAsText(file);
}

// إضافة إحصائيات متقدمة
function getDetailedStats() {
    const totalPossibleDays = 28; // 4 أسابيع × 7 أيام
    const completedDaysCount = Object.keys(completedDays).filter(key => completedDays[key]).length;
    const completionRate = ((completedDaysCount / totalPossibleDays) * 100).toFixed(1);
    
    const weightChange = calculateWeightChange();
    const avgWeightLoss = weightHistory.length > 1 ? 
        (parseFloat(weightChange) / weightHistory.length * 7).toFixed(2) : 0;
    
    return {
        totalDays: totalPossibleDays,
        completedDays: completedDaysCount,
        completionRate: completionRate,
        weightChange: weightChange,
        avgWeeklyWeightLoss: avgWeightLoss,
        totalWeightEntries: weightHistory.length,
        totalNotes: notesHistory.length
    };
}

// تحديث الإحصائيات مع التفاصيل الإضافية
function updateDetailedProgress() {
    const stats = getDetailedStats();
    
    // يمكن إضافة هذه الإحصائيات للواجهة لاحقاً
    console.log('إحصائيات مفصلة:', stats);
}

// تحسين حفظ البيانات مع النسخ الاحتياطي
function saveDataWithBackup(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        // حفظ نسخة احتياطية بتاريخ اليوم
        const backupKey = `${key}_backup_${new Date().toISOString().split('T')[0]}`;
        localStorage.setItem(backupKey, JSON.stringify(data));
    } catch (error) {
        console.error('خطأ في حفظ البيانات:', error);
        alert('حدث خطأ في حفظ البيانات. تأكد من وجود مساحة كافية.');
    }
}