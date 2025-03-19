// 定义mcp server配置类型
export interface McpServerConfig {
    command: string;
    args: string[];
    env: {
        [key: string]: string;
    };
    disabled: boolean;
    autoApprove: string[];
    timeout: number;
}
// 定义mcp client配置类型
export interface McpClientConfig {
    mcpClient: {
        name: string;
        version: string;
    };
    mcpServers: {
        [serverName: string]: McpServerConfig;
    };
}