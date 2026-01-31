export type ResponseType<T = any> = {
  success: boolean;
  statusCode: number;
  message: string;
  timeStamp?: string;
  path?: string;
  data?: T;
  error?: string;
};
