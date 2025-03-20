import OpenAI from "openai";
import {StdioMcpClientToFunction} from "./StdioMcpServerToFunction"
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export class LlmAgent {
    private modelName: string = '';
    private roleMessages: ChatCompletionMessageParam[];
    private messages: ChatCompletionMessageParam[];
    private openai: OpenAI;
    private client: StdioMcpClientToFunction;
    /** 单例实例 */
    private static instance: LlmAgent;

    constructor(client:StdioMcpClientToFunction,baseUrl: string, apiKey: string, modelName: string,sysPrompt?: string) {
        if (!baseUrl) {
            console.log("baseUrl is required");
            return;
        }
        if (!apiKey) {
            console.log("apiKey is required");
            return;
        }
        if (!modelName) {
            console.log("model is required");
            return;
        }
        console.log("Creating LlmAgent instance...");
        console.log(`${baseUrl}, ${apiKey}, ${modelName}`);
        this.modelName = modelName;
        this.client = client;
        this.openai = new OpenAI({
            apiKey: apiKey || '',
            baseURL: baseUrl || '',
        });
        this.roleMessages = [
            {
                role: "system",
                content: sysPrompt || "You are a helpful assistant that can answer questions and help with tasks."
            },
        ];
    }

    /**
     * 获取单例实例
     * 
     * @returns {StdioMcpClientToFunction} 单例实例
     */
    static getInstance(client: StdioMcpClientToFunction,baseUrl: string, apiKey: string, model: string,sysPrompt?: string): LlmAgent {
        if (!this.instance) {
            this.instance = new LlmAgent(client,baseUrl, apiKey, model,sysPrompt);
        }
        return this.instance;
    }


    private async handleToolCalls(response: OpenAI.Chat.Completions.ChatCompletion, messages: ChatCompletionMessageParam[]) {
        let currentResponse = response;
        let counter = 0; // 避免重复打印 AI 的响应消息

        // 处理工具调用, 直到没有工具调用
        while (currentResponse.choices[0].message.tool_calls) {
            // 打印当前 AI 的响应消息
            if (currentResponse.choices[0].message.content && counter !== 0) {
                console.log("\n🤖 AI:", currentResponse.choices[0].message.content);
            }
            counter++;

            for (const toolCall of currentResponse.choices[0].message.tool_calls) {
                const toolName = toolCall.function.name;
                const toolArgs = JSON.parse(toolCall.function.arguments);

                console.log(`\n🔧 调用工具 ${toolName}`);
                console.log(`📝 参数:`, JSON.stringify(toolArgs, null, 2));
                console.log(toolName);
                console.log(toolArgs);

                // 执行工具调用
                const result = await this.client.callTool(toolName, toolArgs);

                // 添加 AI 的响应和工具调用结果到消息历史
                messages.push(currentResponse.choices[0].message);
                messages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: JSON.stringify(result.content),
                } as ChatCompletionMessageParam);
            }

            // 获取下一个响应
            currentResponse = await this.openai.chat.completions.create({
                model: this.modelName || 'deepseek-chat',
                messages: messages,
                tools: this.client.allMcpServer.funcTools,
            });
        }

        return currentResponse;
    }


    async llmQuery(messages: ChatCompletionMessageParam[]): Promise<ChatCompletionMessageParam[]> {
        // 添加到meesages
        if (!messages || (messages && messages.length === 0)) {
            return [];
        }
        console.log("💬 用户:",messages);
        if (messages[0].role === "system" && messages[0].content === this.roleMessages[0].content) {
            this.messages = messages;
        } else {
            this.messages = [...this.roleMessages, ...messages];
        }


        // 如果尚未加载所有 MCP 服务器信息，先加载
        if (!this.client.allMcpServer) {
            await this.client.fetchAllMcpServerData();
        }

        // 初始 OpenAI API 调用
        let response = await this.openai.chat.completions.create({
            model: this.modelName || 'deepseek-chat',
            messages: this.messages,
            tools: this.client.allMcpServer.funcTools,
        });

        // 打印初始响应消息
        if (response.choices[0].message.content) {
            console.log("\n🤖 AI:", response.choices[0].message.content);
        }

        // 如果有工具调用，处理它们
        if (response.choices[0].message.tool_calls) {
            response = await this.handleToolCalls(response, this.messages);
        }
        
        // 将最终响应添加到消息历史
        this.messages.push(response.choices[0].message);

        return this.messages;
    }
}