import { NextRequest, NextResponse } from "next/server";
import { getAcompanhantes, addAcompanhante } from "@/lib/db";

export async function GET() {
  try {
    const acompanhantes = await getAcompanhantes();
    return NextResponse.json(acompanhantes);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar acompanhantes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, telefone, cor } = body;

    if (!nome) {
      return NextResponse.json(
        { error: "Nome e obrigatorio" },
        { status: 400 }
      );
    }

    const cores = [
      "#0D9488",
      "#8B5CF6",
      "#F59E0B",
      "#EC4899",
      "#3B82F6",
      "#10B981",
      "#EF4444",
      "#6366F1",
    ];
    const corAleatoria = cor || cores[Math.floor(Math.random() * cores.length)];

    const novoAcompanhante = await addAcompanhante({
      nome,
      telefone: telefone || "",
      avatar: null,
      cor: corAleatoria,
    });

    return NextResponse.json(novoAcompanhante, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao criar acompanhante" },
      { status: 500 }
    );
  }
}
