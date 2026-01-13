import { NextRequest, NextResponse } from "next/server";
import { getRegistrosAcompanhamento, addRegistroAcompanhamento } from "@/lib/db";

export async function GET() {
  try {
    const registros = await getRegistrosAcompanhamento();
    return NextResponse.json(registros);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar registros" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, tipo, titulo, descricao, gravidade } = body;

    if (!data || !tipo || !titulo) {
      return NextResponse.json(
        { error: "Campos obrigatorios faltando" },
        { status: 400 }
      );
    }

    const novoRegistro = await addRegistroAcompanhamento({
      data,
      tipo,
      titulo,
      descricao: descricao || "",
      gravidade,
    });

    return NextResponse.json(novoRegistro, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao criar registro" },
      { status: 500 }
    );
  }
}
