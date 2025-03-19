import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import * as fs from "fs";
import * as path from "path";
import type { McpClientConfig } from "../../global.d";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { Tool, Prompt, Resource } from "@modelcontextprotocol/sdk/types.js";

export interface AllMcpServerI {
  tools: Tool[];
  funcTools: OpenAiFunctionI[];
  resources: Resource[];
  prompts: Prompt[];
}

export interface OpenAiFunctionI{
  type: "function";
  function: {
    name: string;
    description: string;
    parameters?: {
      type: "object" | "array";
      properties?: Record<string, any>;
      required?: string[];
    } | null;
  };
}


/**
 * StdioMcpClientToFunction 类
 * 
 * 管理与 MCP 服务器的通信，提供工具调用、资源访问等功能。
 * 通过单例模式确保全局只有一个实例。
 */
export class StdioMcpClientToFunction {
  /** MCP 客户端配置 */
  private config: McpClientConfig;

  /** MCP 服务器的传输实例数组 */
  private transports: StdioClientTransport[] = [];

  /** MCP 客户端实例数组 */
  private clients: Client[] = [];

  /** 工具列表 */
  private tools: Tool[] = [];

  private funcTools: OpenAiFunctionI[] = [];

  /** 资源列表 */
  private resources: Resource[] = [];

  /** 提示列表 */
  private prompts: Prompt[] = [];

  /** 缓存的所有 MCP 服务器信息 */
  public allMcpServer: AllMcpServerI | null = null;

  /** 单例实例 */
  private static instance: StdioMcpClientToFunction;

  /**
   * 私有构造函数
   * 
   * 初始化配置文件，解析路径并建立与 MCP 服务器的连接。
   */
  private constructor() {
    this.config = this.loadConfig();
    this.initializeMcpServerConnections();
  }

  /**
   * 获取单例实例
   * 
   * @returns {StdioMcpClientToFunction} 单例实例
   */
  static getInstance(): StdioMcpClientToFunction {
    if (!this.instance) {
      this.instance = new StdioMcpClientToFunction();
    }
    return this.instance;
  }

  /**
   * 加载并解析 MCP 配置文件
   * 
   * @returns {McpClientConfig} 解析后的配置
   * @throws 如果读取配置文件失败则抛出错误
   */
  private loadConfig(): McpClientConfig {
    try {
      // 读取配置文件
      const configData = fs.readFileSync("./mcp.config.json", "utf-8");
      const config: McpClientConfig = JSON.parse(configData);

      // 解析路径，对以 .js 或 .py 结尾的路径进行处理
      for (const key in config.mcpServers) {
        if (config.mcpServers.hasOwnProperty(key)) {
          let args:string[] = config.mcpServers[key].args;
          if (Array.isArray(args)) {
            args = args.map((arg: string) =>
              /\.(js|py)$/.test(arg) ? path.resolve(__dirname, "../../" + arg) : arg
            );
          }
          config.mcpServers[key].args = args;
        }
      }

      return config;
    } catch (error) {
      console.error("读取 mcp.config.json 文件时出错:", error);
      throw error;
    }
  }

  /**
   * 初始化 MCP 服务器连接
   * 
   * 为配置中的每个服务器创建传输和客户端实例。
   */
  private initializeMcpServerConnections() {
    for (const key in this.config.mcpServers) {
      if (this.config.mcpServers.hasOwnProperty(key)) {
        try {
          // 创建传输实例
          const transport = new StdioClientTransport(this.config.mcpServers[key]);
          // 创建客户端实例
          const client = new Client({
            name: key || this.config.mcpClient.name || "mcp-client",
            version: this.config.mcpClient.version || "1.0.0",
          });

          this.transports.push(transport);
          this.clients.push(client);
        } catch (error) {
          console.error("连接 MCP 服务器时出错:", error);
        }
      }
    }
  }

  /**
   * 调用 MCP 工具
   * 
   * @param {string} toolName 工具名称
   * @param {any} [toolArgs] 工具参数，可选
   * @returns {Promise<any>} 工具调用的结果
   */
  async callTool(toolName: string, toolArgs?: any): Promise<any> {
    console.log(`\n🔧 正在调用工具: ${toolName}`);
    console.log(`📝 参数:`, JSON.stringify(toolArgs, null, 2));

    // 如果尚未加载所有 MCP 服务器信息，先加载
    if (!this.allMcpServer) {
      await this.fetchAllMcpServerData();
    }

    // 查找工具所属的客户端
    const toolIndex = this.clients.findIndex((_, i) =>
      this.tools.some((tool) => tool.name === toolName)
    );

    if (toolIndex === -1) {
      console.error(`未找到名为 "${toolName}" 的工具。`);
      return null;
    }
    console.log(toolIndex);

    try {
        // 调用工具
      const result = await this.clients[toolIndex].callTool({
        name: toolName,
        arguments: toolArgs,
      });
      return result;
    } catch (error) {
      console.error(`调用工具 "${toolName}" 时出错:`, error);
      return '调用工具失败';
    }
  }

  /**
   * 获取所有 MCP 服务器的数据（工具、资源、提示）
   * 
   * @returns {Promise<void>}
   */
  async fetchAllMcpServerData(): Promise<void> {
    if (this.allMcpServer) {
        console.log("已使用缓存的 MCP 服务器数据。");
        console.log(this.allMcpServer);
      return;
    }

    this.tools = [];
    this.resources = [];
    this.prompts = [];

    for (let i = 0; i < this.clients.length; i++) {
      try {
        // 连接到 MCP 服务器
        await this.clients[i].connect(this.transports[i]);

          // 获取工具、资源和提示信息
        let tools:Tool[] = [];
        let resources:Resource[] = [];
        let prompts:Prompt[] = [];
        try {
            tools = (await this.clients[i].listTools()).tools as Tool[];
        } catch (e) {
            console.error("从 MCP 服务器获取工具列表时出错:", e);
        }
        try {
            resources = (await this.clients[i].listResources()).resources as Resource[];
        } catch (e) {
            console.error("从 MCP 服务器获取工具列表时出错:", e);
        }
        try {
            prompts = (await this.clients[i].listPrompts()).prompts as Prompt[];
        } catch (e) {
            console.error("从 MCP 服务器获取工具列表时出错:", e);
        }

        this.tools.push(...tools);
        this.resources.push(...resources);
        this.prompts.push(...prompts);
        // 转化function call tools
        this.mcpToolsToFunctionCallTools();
        // 缓存所有数据
        this.allMcpServer = {
            tools: this.tools,
            funcTools: this.funcTools,
            resources: this.resources,
            prompts: this.prompts,
        };
      } catch (error) {
        console.error("从 MCP 服务器获取数据时出错:", error);
      }
    }
  }

  // 转化mcp tools到function call tools
  private mcpToolsToFunctionCallTools(){
    if (!this.tools || (this.tools && this.tools.length <= 0)) {
      return;
    }
    this.funcTools = this.tools.map((tool:Tool) => ({
        type: "function" as const,
        function: {
            name: tool.name as string,
            description: tool.description as string,
            parameters: {
                type: "object",
                properties: tool.inputSchema.properties as Record<string, unknown>,
                required: tool.inputSchema.required as string[],
            },
        }
    }));
  }
}