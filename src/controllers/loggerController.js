export const loggerController = (req, res) => {
  req.logger.warning("Testeando Warning");
  req.logger.error("Testeando Error");
  req.logger.fatal("Testeando Fatal");
  req.logger.info("Testeando Info");
  req.logger.http("Testeando Http");
  req.logger.debug("Testeando Debug");

  res.send({ status: "success", message: "Probando si loguea..." });
};
