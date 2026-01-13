import { NextRequest, NextResponse } from "next/server";
import { removeRegistroAcompanhamento } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await removeRegistroAcompanhamento(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao remover registro" },
      { status: 500 }
    );
  }
}
