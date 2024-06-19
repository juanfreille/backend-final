import { ErrorCodes } from "./enums.js";

export const generateProductsErrorInfo = (missingFields) => {
  return {
    code: ErrorCodes.MISSING_DATA_ERROR,
    message: `Campos faltantes o no válidos: ${missingFields.join(", ")}.`,
  };
};

export const generateInvalidTypeErrorInfo = (field, expectedType) => {
  return {
    code: ErrorCodes.INVALID_TYPES_ERROR,
    message: `Tipo de dato no válido para el campo '${field}'. Tipo esperado: ${expectedType}.`,
  };
};

export const generateDatabaseErrorInfo = (errorMessage) => {
  return {
    code: ErrorCodes.DATABASE_ERROR,
    message: `Error en la base de datos: ${errorMessage}.`,
  };
};

export const generateNotFoundErrorInfo = (resource, id) => {
  return {
    code: ErrorCodes.NOT_FOUND_ERROR,
    message: `${resource} con ID ${id} no ha sido encontrado.`,
  };
};

export const generateRoutingErrorInfo = (route) => {
  return {
    code: ErrorCodes.ROUTING_ERROR,
    message: `Ruta no válida: ${route}.`,
  };
};

export const generateDefaultErrorInfo = (errorMessage) => {
  return {
    code: ErrorCodes.DEFAULT_ERROR,
    message: `Ha sucedido un error inesperado: ${errorMessage}.`,
  };
};

export const generateCartErrorInfo = (missingFields) => {
  return {
    code: ErrorCodes.MISSING_DATA_ERROR,
    message: `Campos faltantes o no válidos: ${missingFields.join(", ")}.`,
  };
};
