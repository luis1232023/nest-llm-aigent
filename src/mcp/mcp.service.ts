import { Injectable } from '@nestjs/common';
import { LlmAgent } from '../common/LlmAgent'; // 替换为实际路径
import { StdioMcpClientToFunction } from '../common/StdioMcpServerToFunction'; // 替换为实际路径
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { ConfigService } from '@nestjs/config';

@Injectable()
export class McpService {
  private readonly mcpClient = StdioMcpClientToFunction.getInstance();
  private readonly configService = new ConfigService();
  private readonly openAiBaseUrl = this.configService.get('OPENAPI_BASE_URL');
  private readonly openAiKey = this.configService.get('OPENAPI_KEY');
  private readonly modelName = this.configService.get('MODEL');
  private readonly sysPrompt = this.configService.get('SYS_PROMPT');
  private readonly llmClient = LlmAgent.getInstance(
    this.mcpClient,
    this.openAiBaseUrl,
    this.openAiKey,
    this.modelName,
    this.sysPrompt
  );
  
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
   * 获取所有工具列表
   * @returns {Promise<any[]>} 所有工具
   */
  async getAllFuncTools(): Promise<any[]> {
    try {
        await this.mcpClient.fetchAllMcpServerData();
        return this.mcpClient.allMcpServer.funcTools // 返回缓存的工具列表
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

  /**
   * 异步查询智能代理返回聊天完成消息参数数组
   *
   * @param messages 聊天完成消息参数数组
   * @returns 返回一个包含聊天完成消息参数数组的Promise对象
   * @throws 如果在查询过程中出现错误，将捕获异常并在控制台输出错误信息，同时返回一个空数组
  */
  async queryAgent(messages:ChatCompletionMessageParam[]): Promise<ChatCompletionMessageParam[]> {
    try {
        console.log('查询智能代理2:', messages);
        const result = await this.llmClient.llmQuery(messages);
        return result;
    } catch (error) {
        console.error(`ai agent 时发生错误:`, error);
        return [];
    }
  }
}
