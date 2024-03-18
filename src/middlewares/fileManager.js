import fs from "fs";

export async function readFromFile(path) {
  try {
    const data = await fs.promises.readFile(path, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error al cargar los datos desde ${path}:`, error);
    return [];
  }
}

export async function writeToFile(path, data) {
  try {
    await fs.promises.writeFile(path, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error al guardar los datos en ${path}:`, error);
  }
}
