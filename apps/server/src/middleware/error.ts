import { AppError } from "@rhythm-battle/shared";

// Elysia Error Context Handler
export function handleError({
  code,
  error,
  set
}: {
  code: string | number;
  error: unknown;
  set: { status?: number | string };
}) {
  const timestamp = new Date().toISOString();

  if (error instanceof AppError) {
    set.status = error.statusCode;
    return {
      success: false,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      errors: error.errors,
      timestamp
    };
  }

  if (code === "NOT_FOUND" || code === 404) {
    set.status = 404;
    return {
      success: false,
      message: "Resource not found",
      code: "NOT_FOUND",
      statusCode: 404,
      timestamp
    };
  }

  if (code === "VALIDATION" || code === 400 || code === "PARSE") {
    set.status = 400;
    return {
      success: false,
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      statusCode: 400,
      timestamp
    };
  }

  const message = error instanceof Error ? error.message : "Internal server error";
  set.status = 500;
  return {
    success: false,
    message,
    code: String(code || "INTERNAL_SERVER_ERROR"),
    statusCode: 500,
    timestamp
  };
}
