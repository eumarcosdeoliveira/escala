import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "db.json");

// GET - Download dos dados
export async function GET() {
  try {
    const data = await fs.readFile(dbPath, "utf-8");
    const jsonData = JSON.parse(data);

    // Adiciona metadata ao backup
    const backup = {
      ...jsonData,
      _backup: {
        exportedAt: new Date().toISOString(),
        version: "1.0",
      },
    };

    return new NextResponse(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="escala-backup-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Erro ao exportar dados:", error);
    return NextResponse.json(
      { error: "Erro ao exportar dados" },
      { status: 500 }
    );
  }
}

// POST - Upload/Restore dos dados
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Valida estrutura basica do backup
    if (!data.acompanhantes || !data.turnos) {
      return NextResponse.json(
        { error: "Arquivo de backup invalido. Deve conter acompanhantes e turnos." },
        { status: 400 }
      );
    }

    // Remove metadata do backup antes de salvar
    const { _backup, ...dbData } = data;

    // Garante que arrays existam
    const cleanData = {
      acompanhantes: dbData.acompanhantes || [],
      turnos: dbData.turnos || [],
      registrosAcompanhamento: dbData.registrosAcompanhamento || [],
    };

    // Salva os dados
    await fs.writeFile(dbPath, JSON.stringify(cleanData, null, 2));

    return NextResponse.json({
      success: true,
      message: "Dados restaurados com sucesso",
      stats: {
        acompanhantes: cleanData.acompanhantes.length,
        turnos: cleanData.turnos.length,
        registrosAcompanhamento: cleanData.registrosAcompanhamento.length,
      },
    });
  } catch (error) {
    console.error("Erro ao restaurar dados:", error);
    return NextResponse.json(
      { error: "Erro ao restaurar dados" },
      { status: 500 }
    );
  }
}
