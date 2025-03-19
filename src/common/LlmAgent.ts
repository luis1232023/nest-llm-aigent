import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export class LlmAgent {
    private baseUrl: string = '';
    private apiKey: string = '';
    private model: string = '';
    private sysPrompt: string = '';
    private messages: ChatCompletionMessageParam[]
    private openai: OpenAI;
    /** 单例实例 */
    private static instance: LlmAgent;

    constructor(baseUrl: string, apiKey: string, model: string,sysPrompt?: string) {
        if (!baseUrl) {
            console.log("baseUrl is required");
            return;
        }
        if (!apiKey) {
            console.log("apiKey is required");
            return;
        }
        if (!model) {
            console.log("model is required");
            return;
        }
        this.openai = new OpenAI({
            apiKey: apiKey || '',
            baseURL: baseUrl || '',
        });
        this.messages = [
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
    static getInstance(baseUrl: string, apiKey: string, model: string,sysPrompt?: string): LlmAgent {
        if (!this.instance) {
            this.instance = new LlmAgent(baseUrl, apiKey, model,sysPrompt);
        }
        return this.instance;
    }


    async llmQuery(query: string): Promise<string> {
        // 添加到meesages
        return "";
    }
}