import { NextRequest, NextResponse } from "next/server";
import { removeAcompanhante, updateAcompanhante } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await removeAcompanhante(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao remover acompanhante" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await updateAcompanhante(parseInt(id), body);
    if (!updated) {
      return NextResponse.json(
        { error: "Acompanhante nao encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao atualizar acompanhante" },
      { status: 500 }
    );
  }
}
