class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(statusCode: number, message: string) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = true;

    // Restore prototype chain (important when extending Error in TS)
    Object.setPrototypeOf(this, new.target.prototype);

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string = "Bad Request"): ApiError {
    return new ApiError(400, message);
  }

  static conflict(message: string = "Conflict Occurred"): ApiError {
    return new ApiError(409, message);
  }

  static unauthorized(message: string = "Unauthorized"): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message: string = "Forbidden"): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message: string = "Not Found"): ApiError {
    return new ApiError(404, message);
  }
}

export default ApiError;