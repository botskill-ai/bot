import Anthropic from '@anthropic-ai/sdk';
import { BaseProvider } from './base.js';
import { ChatMessage, SendOptions, ModelInfo } from '../types.js';

/**
 * Anthropic Claude Provider
 * 使用 Anthropic 官方 SDK，支持 Claude 系列模型
 */

export interface AnthropicProviderOptions {
    apiKey: string;
    baseURL?: string;
    defaultModel?: string;
}

export class AnthropicProvider extends BaseProvider {
    readonly name = 'Anthropic Claude';
    readonly id = 'anthropic';
    private client: Anthropic;

    constructor(options: AnthropicProviderOptions) {
        super(options.defaultModel || 'claude-sonnet-4-20250514');
        this.client = new Anthropic({
            apiKey: options.apiKey,
            baseURL: options.baseURL,
        });
    }

    async sendMessage(
        messages: ChatMessage[],
        systemPrompt?: string,
        options?: SendOptions
    ): Promise<string> {
        const anthropicMessages = this.toAnthropicMessages(messages);

        const response = await this.client.messages.create({
            model: options?.model || this.defaultModel,
            max_tokens: options?.maxTokens || 4096,
            temperature: options?.temperature,
            system: systemPrompt || undefined,
            messages: anthropicMessages,
        });

        const textBlock = response.content.find(
            (block): block is Anthropic.TextBlock => block.type === 'text'
        );
        return textBlock?.text || '';
    }

    async *streamMessage(
        messages: ChatMessage[],
        systemPrompt?: string,
        options?: SendOptions
    ): AsyncGenerator<string, void, unknown> {
        const anthropicMessages = this.toAnthropicMessages(messages);

        const stream = this.client.messages.stream({
            model: options?.model || this.defaultModel,
            max_tokens: options?.maxTokens || 4096,
            temperature: options?.temperature,
            system: systemPrompt || undefined,
            messages: anthropicMessages,
        });

        for await (const event of stream) {
            if (
                event.type === 'content_block_delta' &&
                event.delta.type === 'text_delta'
            ) {
                yield event.delta.text;
            }
        }
    }

    getModels(): ModelInfo[] {
        return [
            {
                id: 'claude-sonnet-4-20250514',
                name: 'Claude Sonnet 4',
                description: '最新旗舰模型，性能卓越',
                maxOutputTokens: 8192,
            },
            {
                id: 'claude-3-5-sonnet-20241022',
                name: 'Claude 3.5 Sonnet',
                description: '高性能模型，适合复杂任务',
                maxOutputTokens: 8192,
            },
            {
                id: 'claude-3-opus-20240229',
                name: 'Claude 3 Opus',
                description: '最强大的模型，适合最复杂的任务',
                maxOutputTokens: 4096,
            },
            {
                id: 'claude-3-sonnet-20240229',
                name: 'Claude 3 Sonnet',
                description: '平衡性能和速度',
                maxOutputTokens: 4096,
            },
            {
                id: 'claude-3-haiku-20240307',
                name: 'Claude 3 Haiku',
                description: '最快最经济的模型',
                maxOutputTokens: 4096,
            },
        ];
    }

    /** 转换为 Anthropic 消息格式 */
    private toAnthropicMessages(
        messages: ChatMessage[]
    ): Anthropic.MessageParam[] {
        return messages
            .filter((m) => m.role === 'user' || m.role === 'assistant')
            .map((m) => ({
                role: m.role as 'user' | 'assistant',
                content: m.content,
            }));
    }
}
