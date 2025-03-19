import { Controller, Post, Body } from '@nestjs/common';
import { ToolsService } from './tools.service';
import { ResponseUtil,ResponseI } from '../common/ResponseUtil';

@Controller('tools')
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  /**
   * 获取所有工具列表
   * @returns {Promise<any[]>} 工具列表
   */
  @Post()
  async getAllTools(): Promise<ResponseI> {
      const tools = await this.toolsService.getAllTools();
      if (!tools) {
        return ResponseUtil.error('获取工具列表失败', null);
      } else {
        return ResponseUtil.success('获取工具列表成功', tools);
      }
  }

  /**
   * 调用 MCP 工具
   * @param {string} toolName 工具名称
   * @param {any} toolArgs 工具参数
   * @returns {Promise<any>} MCP 工具调用结果
   */
    @Post('call')
    async callTool(
        @Body('toolName') toolName: string,
        @Body('toolArgs') toolArgs?: any,
    ): Promise<ResponseI> {
        const res = await this.toolsService.callTool(toolName, toolArgs);
        if (!res) {
            return ResponseUtil.error('调用方法失败', null);
        } else {
            return ResponseUtil.success('调用方法成功', res);
        }
    }
}
