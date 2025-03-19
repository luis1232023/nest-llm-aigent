import { Injectable } from '@nestjs/common';
import { StdioMcpClientToFunction } from '../common/StdioMcpServerToFunction'; // 替换为实际路径

@Injectable()
export class McpService {
  private readonly mcpClient = StdioMcpClientToFunction.getInstance();

  /**
   * 获取所有工具列表
   * @returns {Promise<any[]>} 所有工具
   */
  async getAllTools(): Promise<any[]> {
    try {
        await this.mcpClient.fetchAllMcpServerData();
        return this.mcpClient.allMcpServer.tools // 返回缓存的工具列表
    } catch (error) {
        console.error('获取工具列表失败:', error);
        return null;
    }
  }

  /**
   * 获取所有资源列表
   * @returns {Promise<any[]>} 所有工具
   */
  async getAllResources(): Promise<any[]> {
    try {
        await this.mcpClient.fetchAllMcpServerData();
        return this.mcpClient.allMcpServer.resources // 返回缓存的资源列表
    } catch (error) {
        console.error('获取资源列表失败:', error);
        return null;
    }
  }

  /**
   * 获取所有提示词列表
   * @returns {Promise<any[]>} 所有工具
   */
  async getAllPrompts(): Promise<any[]> {
    try {
        await this.mcpClient.fetchAllMcpServerData();
        return this.mcpClient.allMcpServer.prompts // 返回缓存的提示词列表
    } catch (error) {
        console.error('获取提示词列表失败:', error);
        return null;
    }
  }

  /**
   * 调用 MCP 工具
   * @param {string} toolName 工具名称
   * @param {any} toolArgs 工具参数
   * @returns {Promise<any>} 工具调用结果
   */
  async callTool(toolName: string, toolArgs?: any): Promise<string> {
    try {
        const result = await this.mcpClient.callTool(toolName, toolArgs);
        console.log(`调用工具 "${toolName}" 成功，结果:`, result);
        return result;
    } catch (error) {
        console.error(`调用工具 "${toolName}" 时发生错误:`, error);
        return "";
    }
  }
}
