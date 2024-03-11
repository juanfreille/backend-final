export function handleInternalServerError(res, error) {
  console.error("Error:", error);
  res.status(500).json({ error: "Error interno del servidor" });
}

export function handleNotFoundError(res, message) {
  res.status(404).send(message);
}
