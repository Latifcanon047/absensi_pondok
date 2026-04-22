import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }, //promise harus pakai await karena params itu async, kita harus tunggu sampai params selesai diambil baru bisa digunakan
) {
  try {
    const { id } = await params;
    const { nama } = await request.json();

    if (!nama || nama.trim() === "") {
      return NextResponse.json(
        { error: "Nama santri tidak boleh kosong" },
        { status: 400 },
      );
    }

    const santri = await prisma.santri.update({
      where: { id: parseInt(id) },
      data: { nama: nama.trim() },
    });

    return NextResponse.json(santri);
  } catch (error) {
    console.error("PUT santri error:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate santri" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    await prisma.santri.update({
      where: { id: parseInt(id) },
      data: { isArchived: true }, //Soft Delete: data tidak dihapus, tapi kolom isArchived diubah dari false jadi true. Saat kita ingin menampilkan daftar data ke user (misalnya daftar produk atau catatan), kita tambahkan kondisi { isArchived: false }. Hasilnya? Data yang sudah "dihapus" (diarsip) tidak akan muncul di layar, tapi masih ada di database kalau sewaktu-waktu ingin dikembalikan (restore).
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE santri error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus santri" },
      { status: 500 },
    );
  }
}
