function validateFields(req, res, next) {
  const { title, description, code, price, stock, category } = req.body;
  if (!title || !description || !category || !price || !code || !stock) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }
  next();
}

export { validateFields };
