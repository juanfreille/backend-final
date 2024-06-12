export const generateProductsErrorInfo = (missingFields) => {
  return {
    code: ErrorCodes.MISSING_DATA_ERROR,
    message: `The following fields are missing or invalid: ${missingFields.join(", ")}.`,
  };
};

export const generateInvalidTypeErrorInfo = (field, expectedType) => {
  return {
    code: ErrorCodes.INVALID_TYPES_ERROR,
    message: `Invalid type for field '${field}'. Expected type: ${expectedType}.`,
  };
};

export const generateDatabaseErrorInfo = (errorMessage) => {
  return {
    code: ErrorCodes.DATABASE_ERROR,
    message: `Database error: ${errorMessage}.`,
  };
};

export const generateNotFoundErrorInfo = (resource, id) => {
  return {
    code: ErrorCodes.NOT_FOUND_ERROR,
    message: `${resource} with ID ${id} not found.`,
  };
};

export const generateRoutingErrorInfo = (route) => {
  return {
    code: ErrorCodes.ROUTING_ERROR,
    message: `Invalid route: ${route}.`,
  };
};

export const generateDefaultErrorInfo = (errorMessage) => {
  return {
    code: ErrorCodes.DEFAULT_ERROR,
    message: `An unexpected error occurred: ${errorMessage}.`,
  };
};

export const generateCartErrorInfo = (missingFields) => {
  return {
    code: ErrorCodes.MISSING_DATA_ERROR,
    message: `The following fields are missing or invalid: ${missingFields.join(", ")}.`,
  };
};
