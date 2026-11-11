export interface ErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface AppErrorResponse {
  success: false;
  message: string;
  code: string;
  statusCode: number;
  errors?: ErrorDetail[];
  timestamp: string;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly errors?: ErrorDetail[];

  constructor(message: string, statusCode = 500, code = "INTERNAL_SERVER_ERROR", errors?: ErrorDetail[]) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
  }
}

