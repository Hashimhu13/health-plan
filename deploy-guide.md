# نشر التطبيق على GitHub Pages

## الخطوات المطلوبة:

### 1. إنشاء مستودع جديد على GitHub
```bash
# في terminal/command prompt
cd "c:\003Project\HELTH2"
git init
git add .
git commit -m "إضافة تطبيق متتبع خطة إنقاص الوزن"
```

### 2. ربط المستودع بـ GitHub
```bash
git remote add origin https://github.com/[اسم-المستخدم]/weight-loss-tracker.git
git branch -M main
git push -u origin main
```

### 3. تفعيل GitHub Pages
1. اذهب إلى إعدادات المستودع على GitHub
2. انتقل إلى قسم "Pages"
3. اختر "Deploy from a branch"
4. اختر "main" branch
5. اختر "/ (root)" folder
6. اضغط "Save"

### 4. الوصول للتطبيق
سيكون التطبيق متاحاً على:
`https://[اسم-المستخدم].github.io/weight-loss-tracker`

## ملفات المشروع:

- `index.html` - الصفحة الرئيسية
- `styles.css` - ملف التصميم
- `script.js` - ملف الوظائف
- `data.js` - بيانات الخطة والسعرات
- `README.md` - توثيق المشروع
- `deploy-guide.md` - دليل النشر (هذا الملف)

## نصائح إضافية:

### إضافة اسم نطاق مخصص (اختياري)
يمكنك إضافة ملف `CNAME` يحتوي على نطاقك المخصص

### تحديث التطبيق
```bash
git add .
git commit -m "تحديث التطبيق"
git push origin main
```

### إضافة favicon
أضف ملف `favicon.ico` في المجلد الرئيسي وأضف هذا السطر في `<head>`:
```html
<link rel="icon" type="image/x-icon" href="favicon.ico">
```

### تحسين SEO
أضف هذه العلامات في `<head>`:
```html
<meta name="description" content="تطبيق متتبع خطة إنقاص الوزن - تتبع وجباتك ووزنك بسهولة">
<meta name="keywords" content="إنقاص الوزن, دايت, تتبع الوزن, حاسبة السعرات">
<meta property="og:title" content="متتبع خطة إنقاص الوزن">
<meta property="og:description" content="تطبيق شامل لتتبع خطة إنقاص الوزن">
<meta property="og:type" content="website">
```

## استكشاف الأخطاء:

### إذا لم يظهر التطبيق:
1. تأكد من أن الملفات في المجلد الرئيسي
2. تأكد من أن اسم الملف `index.html` (بأحرف صغيرة)
3. انتظر بضع دقائق حتى يتم النشر

### إذا كان التصميم لا يظهر:
1. تأكد من المسارات الصحيحة للملفات
2. تأكد من أن ملفات CSS و JS في نفس المجلد

## أمان البيانات:
- البيانات محفوظة محلياً في المتصفح
- لا يتم إرسال أي بيانات للخادم
- يمكن للمستخدم تصدير واستيراد بياناته