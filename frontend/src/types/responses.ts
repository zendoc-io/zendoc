export interface ApiResponse<T = Record<string, unknown>> {
  status: string;
  data?: T;
}
