import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = process.env.ADMIN_PASSWORD || "Admin123";
  const hash = await bcrypt.hash(password, 12);
  await prisma.admin.upsert({
    // Gunakan upsert untuk memastikan tidak ada duplikasi admin jika seed dijalankan lebih dari sekali
    where: { username: "admin" },
    update: {}, // Jika admin sudah ada, tidak perlu update apa-apa
    create: {
      // Jika admin belum ada, buat baru dengan username "admin" dan password yang sudah di-hash
      username: "admin",
      password: hash,
    },
  });
  console.log("✅ Seed berhasil! Username: admin | Password: " + password);
}

main().finally(() => prisma.$disconnect()); //tutup koneksi ke database setelah selesai menjalankan seed
