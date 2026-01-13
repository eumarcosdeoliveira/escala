import { NextRequest, NextResponse } from "next/server";
import { updateTurno, removeTurno } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    const turnoAtualizado = await updateTurno(id, body);

    if (!turnoAtualizado) {
      return NextResponse.json(
        { error: "Turno nao encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(turnoAtualizado);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao atualizar turno" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    await removeTurno(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao remover turno" },
      { status: 500 }
    );
  }
}
