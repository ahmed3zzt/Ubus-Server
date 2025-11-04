import bcrypt from "bcryptjs";
import mongoose from "mongoose";


const driverSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: [true, "اسم السائق مطلوب"],
        trim: true,
      },
      phone: {
        type: String,
        required: [true, "رقم الهاتف مطلوب"],
        unique: true,
        match: [/^01[0-9]{9}$/, "رقم الهاتف غير صحيح (يجب أن يبدأ بـ 01)"],
      },
      password: {
        type: String,
        required: [true, "كلمة المرور مطلوبة"],
        minlength: [6, "كلمة المرور قصيرة جدًا"],
      },
      busNumber: {
        type: String,
        unique: true,
      },
      busCapacity: {
        type: Number,
        default: 18,
      },
      route: {
        from: {
          type: String,
          default: "جامعة سوهاج",
        },
        to: {
          type: String,
          enum: ["موقف بحري", "دار السلام", "المحافظة", "أخميم"],
          required: [true, "مطلوب اختيار خط السير"],
        },
      },
      isActive: {
        type: Boolean,
        default: true,
      },
    },
    { timestamps: true }
  );
  
  //  تشفير كلمة المرور قبل الحفظ
  driverSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
  
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  });
  
  // توليد رقم الباص تلقائي عند التسجيل
  driverSchema.pre("save", async function (next) {
    if (this.busNumber) return next();
  
    const Driver = mongoose.model("Driver", driverSchema);
    const count = await Driver.countDocuments();
    this.busNumber = `DFRD${count + 1}`;
    next();
  });
  
  //  مقارنة كلمة المرور عند تسجيل الدخول
  driverSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };
  
  // تصدير الموديل
  const Driver = mongoose.model("Driver", driverSchema);
  export default Driver;