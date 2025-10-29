# استخدم Node الرسمي
FROM node:20

# مجلد العمل داخل الحاوية
WORKDIR /usr/src/app

# نسخ ملفات package.json أولاً (للاستفادة من الـ cache)
COPY package*.json ./

# تثبيت الاعتماديات
RUN npm install

# نسخ باقي المشروع
COPY . .

# فتح المنفذ
EXPOSE 3000

# أمر التشغيل الافتراضي
CMD ["npm", "run", "dev"]
