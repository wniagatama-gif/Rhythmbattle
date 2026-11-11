export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  timestamp?: string;
}

export interface HealthResponse {
  success: boolean;
  message: string;
  service: string;
  environment?: string;
  timestamp?: string;
}

