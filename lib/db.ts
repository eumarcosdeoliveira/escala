import { promises as fs } from "fs";
import path from "path";
import { Database, Acompanhante, Turno, RegistroAcompanhamento } from "./types";

const dbPath = path.join(process.cwd(), "data", "db.json");

export async function getDatabase(): Promise<Database> {
  const data = await fs.readFile(dbPath, "utf-8");
  return JSON.parse(data);
}

export async function saveDatabase(db: Database): Promise<void> {
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
}

export async function getAcompanhantes(): Promise<Acompanhante[]> {
  const db = await getDatabase();
  return db.acompanhantes;
}

export async function addAcompanhante(
  acompanhante: Omit<Acompanhante, "id">
): Promise<Acompanhante> {
  const db = await getDatabase();
  const newId = Math.max(...db.acompanhantes.map((a) => a.id), 0) + 1;
  const newAcompanhante = { ...acompanhante, id: newId };
  db.acompanhantes.push(newAcompanhante);
  await saveDatabase(db);
  return newAcompanhante;
}

export async function removeAcompanhante(id: number): Promise<void> {
  const db = await getDatabase();
  db.acompanhantes = db.acompanhantes.filter((a) => a.id !== id);
  db.turnos = db.turnos.filter((t) => t.acompanhanteId !== id);
  await saveDatabase(db);
}

export async function updateAcompanhante(
  id: number,
  data: Partial<Acompanhante>
): Promise<Acompanhante | null> {
  const db = await getDatabase();
  const index = db.acompanhantes.findIndex((a) => a.id === id);
  if (index === -1) return null;
  db.acompanhantes[index] = { ...db.acompanhantes[index], ...data };
  await saveDatabase(db);
  return db.acompanhantes[index];
}

export async function getTurnos(): Promise<Turno[]> {
  const db = await getDatabase();
  return db.turnos;
}

export async function getTurnosByData(data: string): Promise<Turno[]> {
  const db = await getDatabase();
  return db.turnos.filter((t) => t.data === data);
}

export async function getTurnosByWeek(
  startDate: string,
  endDate: string
): Promise<Turno[]> {
  const db = await getDatabase();
  return db.turnos.filter((t) => t.data >= startDate && t.data <= endDate);
}

export async function addTurno(turno: Omit<Turno, "id">): Promise<Turno> {
  const db = await getDatabase();
  const newId = Math.max(...db.turnos.map((t) => t.id), 0) + 1;
  const newTurno = { ...turno, id: newId };
  db.turnos.push(newTurno);
  await saveDatabase(db);
  return newTurno;
}

export async function updateTurno(
  id: number,
  turno: Partial<Turno>
): Promise<Turno | null> {
  const db = await getDatabase();
  const index = db.turnos.findIndex((t) => t.id === id);
  if (index === -1) return null;
  db.turnos[index] = { ...db.turnos[index], ...turno };
  await saveDatabase(db);
  return db.turnos[index];
}

export async function removeTurno(id: number): Promise<void> {
  const db = await getDatabase();
  db.turnos = db.turnos.filter((t) => t.id !== id);
  await saveDatabase(db);
}

// Registros de Acompanhamento
export async function getRegistrosAcompanhamento(): Promise<RegistroAcompanhamento[]> {
  const db = await getDatabase();
  return db.registrosAcompanhamento || [];
}

export async function addRegistroAcompanhamento(
  registro: Omit<RegistroAcompanhamento, "id" | "createdAt">
): Promise<RegistroAcompanhamento> {
  const db = await getDatabase();
  if (!db.registrosAcompanhamento) {
    db.registrosAcompanhamento = [];
  }
  const newId = Math.max(...db.registrosAcompanhamento.map((r) => r.id), 0) + 1;
  const newRegistro: RegistroAcompanhamento = {
    ...registro,
    id: newId,
    createdAt: new Date().toISOString(),
  };
  db.registrosAcompanhamento.push(newRegistro);
  await saveDatabase(db);
  return newRegistro;
}

export async function removeRegistroAcompanhamento(id: number): Promise<void> {
  const db = await getDatabase();
  db.registrosAcompanhamento = (db.registrosAcompanhamento || []).filter((r) => r.id !== id);
  await saveDatabase(db);
}
