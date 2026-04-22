import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const santri = await prisma.santri.findMany({
      where: { isArchived: false }, //Dalam dunia programming, kita jarang benar-benar menghapus data secara permanen dari database (karena berbahaya kalau salah hapus). Sebagai gantinya, kita menggunakan teknik Soft Delete:
      //Data tidak dihapus, tapi kolom isArchived diubah dari false jadi true.
      //Saat kita ingin menampilkan daftar data ke user (misalnya daftar produk atau catatan), kita tambahkan kondisi { isArchived: false }.
      //Hasilnya? Data yang sudah "dihapus" (diarsip) tidak akan muncul di layar, tapi masih ada di database kalau sewaktu-waktu ingin dikembalikan (restore).
      orderBy: { nama: "asc" },
    });
    return NextResponse.json(santri);
  } catch (error) {
    console.error("GET santri error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data santri" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nama } = await request.json();

    if (!nama || nama.trim() === "") {
      return NextResponse.json(
        { error: "Nama santri tidak boleh kosong" },
        { status: 400 },
      );
    }

    const santri = await prisma.santri.create({
      data: { nama: nama.trim() },
    });

    return NextResponse.json(santri, { status: 201 });
  } catch (error) {
    console.error("POST santri error:", error);
    return NextResponse.json(
      { error: "Gagal menambah santri" },
      { status: 500 },
    );
  }
}
