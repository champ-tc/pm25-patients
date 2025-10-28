import { z } from "zod";

// ✅ enum ต้องตรงกับ Prisma
export const RoleValues = [
    "administrator",
    "superadmin",
    "admin",
    "region",
    "province",
    "unit",
] as const;

const emptyToUndefined = z.string().trim().transform(v => (v === "" ? undefined : v));
const optionalTrim = z.string().trim().optional().transform(v => (v === "" ? undefined : v));

export const AdminCreateSchema = z.object({
    username: z.string()
        .trim()
        .min(3, "Username ต้องยาวอย่างน้อย 3 ตัวอักษร")
        .max(30, "Username ยาวเกินไป")
        .regex(/^[a-zA-Z0-9._-]+$/, "ใช้ได้เฉพาะ a-z 0-9 . _ -"),

    password: z
        .string()
        .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
        .max(30, "รหัสผ่านยาวเกินไป")
        .regex(/[a-z]/, "ต้องมีตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว")
        .regex(/[A-Z]/, "ต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว")
        .regex(/[0-9]/, "ต้องมีตัวเลขอย่างน้อย 1 ตัว"),


    role: z.enum(RoleValues).default("admin"),

    // ข้อมูลบุคคล
    pname: optionalTrim,                // "นาย/นาง/นางสาว" หรือ undefined
    fname: z.string().trim().min(1, "กรุณากรอกชื่อ"),
    lname: z.string().trim().min(1, "กรุณากรอกสกุล"),

    // หน่วยงาน (ไม่บังคับ)
    hospcode: emptyToUndefined
        .pipe(z.string().regex(/^[A-Z0-9]{4,12}$/i, "รหัสหน่วยบริการไม่ถูกต้อง").optional())
        .optional(),

    position: optionalTrim,
    positionLv: optionalTrim,

    tel: optionalTrim
        .pipe(z.string().regex(/^0\d{8,9}$/, "เบอร์โทรไม่ถูกต้อง").optional())
        .optional(),

    email: optionalTrim
        .pipe(z.string().email("อีเมลไม่ถูกต้อง").optional())
        .optional(),
});

export type AdminCreateInput = z.infer<typeof AdminCreateSchema>;
