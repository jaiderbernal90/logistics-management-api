export interface ErrorResponseDto {
  status: string;
  message: string;
  errors?: Record<string, string>;
}

export interface SuccessResponseDto<T> {
  status: string;
  data: T;
}

export class ApiResponse {
  static success<T>(data: T): SuccessResponseDto<T> {
    return {
      status: 'success',
      data,
    };
  }

  static error(
    message: string,
    errors?: Record<string, string>,
  ): ErrorResponseDto {
    return {
      status: 'error',
      message,
      errors,
    };
  }
}
