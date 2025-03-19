export interface ResponseI{
    success: boolean;
    message: string;
    data?: any;
}
export class ResponseUtil {
    static success(message: string, data: any = {}):ResponseI {
      return {
        success: true,
        message,
        data,
      };
    }
  
    static error(message: string, data: any = {}):ResponseI {
      return {
        success: false,
        message,
        data,
      };
    }
}
  