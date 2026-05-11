import fs from "fs";
import path from "path";

// Función genérica type-safe para leer cualquier JSON de /data
export function readData<T>(filename: string): T {
  const filePath = path.join(process.cwd(), "data", filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}
