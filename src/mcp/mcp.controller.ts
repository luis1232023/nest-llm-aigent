import { Controller, Post, Body } from '@nestjs/common';
import { McpService } from './mcp.service';
import { ResponseUtil,ResponseI } from '../common/ResponseUtil';

@Controller('/api/mcp')
export class McpController {
  constructor(private readonly mcpService: McpService) {}

  /**
   * 获取所有工具列表
   * @returns {Promise<any[]>} 工具列表
   */
  @Post('/tools')
  async getAllTools(): Promise<ResponseI> {
      const tools = await this.mcpService.getAllTools();
      if (!tools) {
        return ResponseUtil.error('获取工具列表失败', null);
      } else {
        return ResponseUtil.success('获取工具列表成功', tools);
      }
    }
    
  /**
   * 获取所有function call tools工具列表
   * @returns {Promise<any[]>} 工具列表
   */
  @Post('/functools')
  async getAllFuncTools(): Promise<ResponseI> {
      const tools = await this.mcpService.getAllFuncTools();
      if (!tools) {
        return ResponseUtil.error('获取function call工具列表失败', null);
      } else {
        return ResponseUtil.success('获取function call工具列表成功', tools);
      }
  }

  /**
   * 调用 MCP 工具
   * @param {string} toolName 工具名称
   * @param {any} toolArgs 工具参数
   * @returns {Promise<any>} MCP 工具调用结果
   */
    @Post('/tools/call')
    async callTool(
        @Body('toolName') toolName: string,
        @Body('toolArgs') toolArgs?: any,
    ): Promise<ResponseI> {
        const res = await this.mcpService.callTool(toolName, toolArgs);
        if (!res) {
            return ResponseUtil.error('调用方法失败', null);
        } else {
            return ResponseUtil.success('调用方法成功', res);
        }
    }

    /**
     * 获取资源列表
     * @returns {Promise<ResponseI>} 资源列表
     */
    @Post('/resources')
    async getResources(): Promise<ResponseI> {
        const resources = await this.mcpService.getAllResources();
        if (!resources) {
        return ResponseUtil.error('获取资源列表失败', null);
        }
        return ResponseUtil.success('获取资源列表成功', resources);
    }

    /**
     * 获取提示词列表
     * @returns {Promise<ResponseI>} 资源列表
     */
    @Post('/prompts')
    async getPrompts(): Promise<ResponseI> {
        const prompts = await this.mcpService.getAllPrompts();
        if (!prompts) {
            return ResponseUtil.error('获取提示词列表失败', null);
        }
        return ResponseUtil.success('获取提示词列表成功', prompts);
    }
}
