const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// این خط به سرور میگه که فایل index.html رو به کاربران نشون بده
app.use(express.static(__dirname));

// اتصال به دیتابیس MongoDB ایران (توسط لینک داخلی ران‌فلر)
const mongoURI = 'mongodb://admin:lTXwknrRLBHFape4g96b@animeblack-app-dos-service:27017/admin';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ Connected to Iran MongoDB successfully!'))
    .catch(err => console.log('❌ MongoDB Connection Error: ', err));

// ساخت یک مدل ساده برای ذخیره کل اطلاعات سایت به صورت یکجا
const DataSchema = new mongoose.Schema({
    identifier: String,
    dbPayload: Object
}, { strict: false });

const DataModel = mongoose.model('SiteData', DataSchema);

// مسیر دریافت اطلاعات از دیتابیس ایران
app.get('/api/get-data', async (req, res) => {
    try {
        const data = await DataModel.findOne({ identifier: 'main_database' });
        res.json(data && data.dbPayload ? data.dbPayload : null);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// مسیر ذخیره اطلاعات در دیتابیس ایران
app.post('/api/save-data', async (req, res) => {
    try {
        const newPayload = req.body;
        await DataModel.findOneAndUpdate(
            { identifier: 'main_database' },
            { identifier: 'main_database', dbPayload: newPayload },
            { upsert: true, new: true }
        );
        res.json({ success: true, message: 'اطلاعات با موفقیت ذخیره شد' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// هر آدرسی که کاربر زد، همون سایت اصلی براش باز بشه
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// اجرای سرور
const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});