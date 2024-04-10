import fs from "fs";

export function readFromFile(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, "utf8", (err, data) => {
      if (err) {
        console.error(`Error al cargar los datos desde ${file}:`, err);
        reject(err);
        return;
      }
      resolve(data);
    });
  });
}

export function writeToFile(file, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, JSON.stringify(data, null, "\t"), (err) => {
      if (err) {
        console.error(`Error al guardar los datos en ${file}:`, err);
        reject(err);
        return;
      }
      resolve();
    });
  });
}
