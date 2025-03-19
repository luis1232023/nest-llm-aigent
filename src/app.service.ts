import { Injectable } from '@nestjs/common';
import { StdioMcpClientToFunction } from './common/StdioMcpClientToFunction';

@Injectable()
export class AppService {
  async getHello(): Promise<string> {
    // const stdioMcpClientToFunction = StdioMcpClientToFunction.getInstance();
    // const tools = await stdioMcpClientToFunction.callTool("get_hospital_by_city", {
    //   city:"上海"
    // })
    // const tools = await stdioMcpClientToFunction.getAllMcpServer();
    return JSON.stringify("hello world");
  }
}
