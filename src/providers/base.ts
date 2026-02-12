import { ChatMessage, SendOptions, ModelInfo } from '../types.js';

/**
 * Provider 抽象基类
 * 所有大模型提供商都需要继承此类
 */
export abstract class BaseProvider {
    /** 提供商显示名称 */
    abstract readonly name: string;
    /** 提供商唯一标识 */
    abstract readonly id: string;

    protected defaultModel: string;

    constructor(defaultModel: string) {
        this.defaultModel = defaultModel;
    }

    /**
     * 发送消息并获取完整响应
     */
    abstract sendMessage(
        messages: ChatMessage[],
        systemPrompt?: string,
        options?: SendOptions
    ): Promise<string>;

    /**
     * 流式发送消息
     */
    abstract streamMessage(
        messages: ChatMessage[],
        systemPrompt?: string,
        options?: SendOptions
    ): AsyncGenerator<string, void, unknown>;

    /** 获取支持的模型列表 */
    abstract getModels(): ModelInfo[];

    /** 获取当前默认模型 */
    getDefaultModel(): string {
        return this.defaultModel;
    }

    /** 设置默认模型 */
    setDefaultModel(model: string): void {
        this.defaultModel = model;
    }
}
