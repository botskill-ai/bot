import OpenAI from 'openai';
import { BaseProvider } from './base.js';
import { ChatMessage, SendOptions, ModelInfo } from '../types.js';

/**
 * OpenAI 兼容 Provider
 * 适用于所有兼容 OpenAI Chat Completions API 的服务：
 * - OpenAI (GPT 系列)
 * - 阿里云百炼 (Qwen 系列)
 * - DeepSeek
 * - 月之暗面 (Moonshot)
 * - 智谱 AI (GLM 系列)
 * - Ollama (本地模型)
 * - 等等...
 */

export interface OpenAIProviderOptions {
    apiKey: string;
    baseURL?: string;
    defaultModel?: string;
    /** 自定义提供商名称 */
    name?: string;
    /** 自定义提供商 ID */
    id?: string;
    /** 可用模型列表 */
    models?: ModelInfo[];
}

export class OpenAIProvider extends BaseProvider {
    readonly name: string;
    readonly id: string;
    private client: OpenAI;
    private modelList: ModelInfo[];

    constructor(options: OpenAIProviderOptions) {
        super(options.defaultModel || 'gpt-4o');
        this.name = options.name || 'OpenAI';
        this.id = options.id || 'openai';
        this.modelList = options.models || [
            { id: 'gpt-4o', name: 'GPT-4o', description: '最新的多模态旗舰模型' },
            { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: '更快更经济的 GPT-4o' },
            { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'GPT-4 Turbo 版本' },
            { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: '快速经济的模型' },
        ];

        this.client = new OpenAI({
            apiKey: options.apiKey,
            baseURL: options.baseURL,
        });
    }

    async sendMessage(
        messages: ChatMessage[],
        systemPrompt?: string,
        options?: SendOptions
    ): Promise<string> {
        const msgs = this.buildMessages(messages, systemPrompt);

        const response = await this.client.chat.completions.create({
            model: options?.model || this.defaultModel,
            messages: msgs,
            max_tokens: options?.maxTokens,
            temperature: options?.temperature,
            top_p: options?.topP,
        });

        return response.choices[0]?.message?.content || '';
    }

    async *streamMessage(
        messages: ChatMessage[],
        systemPrompt?: string,
        options?: SendOptions
    ): AsyncGenerator<string, void, unknown> {
        const msgs = this.buildMessages(messages, systemPrompt);

        const stream = await this.client.chat.completions.create({
            model: options?.model || this.defaultModel,
            messages: msgs,
            max_tokens: options?.maxTokens,
            temperature: options?.temperature,
            top_p: options?.topP,
            stream: true,
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
                yield content;
            }
        }
    }

    getModels(): ModelInfo[] {
        return this.modelList;
    }

    /** 构建消息列表（含 system prompt） */
    private buildMessages(
        messages: ChatMessage[],
        systemPrompt?: string
    ): OpenAI.ChatCompletionMessageParam[] {
        const result: OpenAI.ChatCompletionMessageParam[] = [];
        if (systemPrompt) {
            result.push({ role: 'system', content: systemPrompt });
        }
        result.push(
            ...messages.map((m) => ({
                role: m.role as 'system' | 'user' | 'assistant',
                content: m.content,
            }))
        );
        return result;
    }
}
