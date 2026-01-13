import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "db.json");
const uploadsPath = path.join(process.cwd(), "public", "uploads");

// Converte arquivo para base64
async function fileToBase64(filePath: string): Promise<string | null> {
  try {
    const fullPath = path.join(process.cwd(), "public", filePath);
    const fileBuffer = await fs.readFile(fullPath);
    const extension = path.extname(filePath).toLowerCase().slice(1);
    const mimeType = extension === "png" ? "image/png" : extension === "jpg" || extension === "jpeg" ? "image/jpeg" : "image/webp";
    return `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
  } catch {
    return null;
  }
}

// Salva base64 como arquivo
async function base64ToFile(base64: string, originalPath: string): Promise<string> {
  try {
    // Extrai dados do base64
    const matches = base64.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      return originalPath;
    }

    const extension = matches[1] === "jpeg" ? "jpg" : matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, "base64");

    // Garante que o diretorio existe
    await fs.mkdir(uploadsPath, { recursive: true });

    // Gera nome unico
    const filename = `avatar_${Date.now()}.${extension}`;
    const filepath = path.join(uploadsPath, filename);

    await fs.writeFile(filepath, buffer);

    return `/uploads/${filename}`;
  } catch (error) {
    console.error("Erro ao salvar imagem:", error);
    return originalPath;
  }
}

// GET - Download dos dados com fotos em base64
export async function GET() {
  try {
    const data = await fs.readFile(dbPath, "utf-8");
    const jsonData = JSON.parse(data);

    // Converte avatares para base64
    const acompanhantesComFotos = await Promise.all(
      (jsonData.acompanhantes || []).map(async (acompanhante: { avatar?: string; [key: string]: unknown }) => {
        if (acompanhante.avatar && acompanhante.avatar.startsWith("/uploads/")) {
          const base64 = await fileToBase64(acompanhante.avatar);
          return {
            ...acompanhante,
            avatar: base64 || acompanhante.avatar,
            _originalAvatar: acompanhante.avatar, // Guarda path original para referencia
          };
        }
        return acompanhante;
      })
    );

    // Adiciona metadata ao backup
    const backup = {
      ...jsonData,
      acompanhantes: acompanhantesComFotos,
      _backup: {
        exportedAt: new Date().toISOString(),
        version: "2.0",
        includesPhotos: true,
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

// POST - Upload/Restore dos dados com fotos
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

    // Remove metadata do backup
    const { _backup, ...dbData } = data;

    // Restaura fotos dos acompanhantes
    let photosRestored = 0;
    const acompanhantesProcessados = await Promise.all(
      (dbData.acompanhantes || []).map(async (acompanhante: { avatar?: string; _originalAvatar?: string; [key: string]: unknown }) => {
        const { _originalAvatar, ...rest } = acompanhante;

        // Se o avatar e base64, salva como arquivo
        if (rest.avatar && rest.avatar.startsWith("data:image/")) {
          const newPath = await base64ToFile(rest.avatar, _originalAvatar || "");
          photosRestored++;
          return {
            ...rest,
            avatar: newPath,
          };
        }

        return rest;
      })
    );

    // Garante que arrays existam
    const cleanData = {
      acompanhantes: acompanhantesProcessados,
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
        photosRestored,
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
