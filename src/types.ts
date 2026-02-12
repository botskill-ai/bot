/**
 * 核心类型定义
 */

/** 聊天消息 */
export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

/** 发送选项 */
export interface SendOptions {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    topP?: number;
}

/** 模型信息 */
export interface ModelInfo {
    id: string;
    name: string;
    description?: string;
    maxOutputTokens?: number;
}

/** Provider 初始化选项 */
export interface ProviderOptions {
    apiKey: string;
    baseURL?: string;
    defaultModel?: string;
}

/** Agent 配置选项 */
export interface AgentOptions {
    systemPrompt?: string;
    maxHistory?: number;
    streaming?: boolean;
}
