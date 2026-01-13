import { NextRequest, NextResponse } from "next/server";
import { getTurnos, getTurnosByWeek, addTurno } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let turnos;
    if (startDate && endDate) {
      turnos = await getTurnosByWeek(startDate, endDate);
    } else {
      turnos = await getTurnos();
    }

    return NextResponse.json(turnos);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar turnos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { acompanhanteId, data, periodo, horaInicio, horaFim, observacao, pontosAtencao } =
      body;

    if (!acompanhanteId || !data || !periodo || !horaInicio || !horaFim) {
      return NextResponse.json(
        { error: "Campos obrigatorios faltando" },
        { status: 400 }
      );
    }

    const novoTurno = await addTurno({
      acompanhanteId,
      data,
      periodo,
      horaInicio,
      horaFim,
      observacao: observacao || "",
      pontosAtencao: pontosAtencao || "",
    });

    return NextResponse.json(novoTurno, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao criar turno" },
      { status: 500 }
    );
  }
}
