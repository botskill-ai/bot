import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import {ClaudeModelName, DEFAULT_MODEL, getModelInfo} from './models.js';
import {ProviderConfig, getProvider} from './providers.js';
import * as readline from "node:readline/promises";
import * as Console from "node:console";

// 加载环境变量
dotenv.config();

/**
 * Agent 配置选项
 */
export interface ClaudeAgentOptions {
    systemPrompt?: string;
    model?: ClaudeModelName | string; // 支持自定义模型名称
    maxTokens?: number;
    temperature?: number;
    // 兼容 API 配置
    apiKey?: string; // 自定义 API Key
    baseURL?: string; // 自定义 API 端点
    provider?: string | ProviderConfig; // 提供商 ID 或自定义配置
}

/**
 * Agent 类 - 封装 Claude API 调用
 */
export class ClaudeAgent {
    private client: Anthropic;
    private systemPrompt: string;
    private model: ClaudeModelName | string;
    private maxTokens: number;
    private temperature?: number;
    private baseURL?: string;

    constructor(options?: ClaudeAgentOptions) {
        // 处理提供商配置
        let apiKey = options?.apiKey || process.env.ANTHROPIC_API_KEY || '';
        let baseURL = options?.baseURL;

        // 如果指定了提供商
        if (options?.provider) {
            let providerConfig: ProviderConfig | undefined;

            if (typeof options.provider === 'string') {
                providerConfig = getProvider(options.provider);
            } else {
                providerConfig = options.provider;
            }

            if (providerConfig) {
                baseURL = baseURL || providerConfig.baseURL;
                // 如果提供商需要特定的 API Key 格式，可以在这里处理
            }
        }

        // 创建 Anthropic 客户端
        const clientOptions: {
            apiKey: string;
            baseURL?: string;
        } = {
            apiKey,
        };

        // 如果指定了自定义 baseURL，使用它
        if (baseURL) {
            clientOptions.baseURL = baseURL;
        }

        this.client = new Anthropic(clientOptions);
        this.baseURL = baseURL;
        this.systemPrompt = options?.systemPrompt || '你是一个有用的 AI 助手。';
        this.model = options?.model || DEFAULT_MODEL;

        // 如果是自定义模型名称，使用默认 maxTokens，否则使用模型配置
        if (typeof this.model === 'string' && !getModelInfo(this.model as ClaudeModelName)) {
            this.maxTokens = options?.maxTokens || 2048;
        } else {
            this.maxTokens = options?.maxTokens || getModelInfo(this.model as ClaudeModelName).maxTokens;
        }
        this.temperature = options?.temperature;
    }

    /**
     * 发送消息并获取响应
     */
    async sendMessage(
        message: string,
        conversationHistory: Anthropic.MessageParam[] = [],
        options?: { model?: ClaudeModelName | string; maxTokens?: number; temperature?: number }
    ): Promise<string> {
        try {
            const model = options?.model || this.model;
            const maxTokens = options?.maxTokens || this.maxTokens;
            const temperature = options?.temperature ?? this.temperature;

            const response = await this.client.messages.create({
                model,
                max_tokens: maxTokens,
                temperature,
                system: this.systemPrompt,
                messages: [
                    ...conversationHistory,
                    {
                        role: 'user',
                        content: message,
                    },
                ],
            });

            // 提取文本内容
            const textContent = response.content.find(
                (block): block is Anthropic.TextBlock => block.type === 'text'
            );

            return textContent?.text || '未收到有效响应';
        } catch (error: any) {
            // 提供更详细的错误信息
            const errorMessage = error?.message || '未知错误';
            const statusCode = error?.status || error?.statusCode;

            console.error('调用 API 时出错:');
            console.error(`  错误信息: ${errorMessage}`);
            if (statusCode) {
                console.error(`  HTTP 状态码: ${statusCode}`);
            }
            if (this.baseURL) {
                console.error(`  API 端点: ${this.baseURL}`);
            }
            console.error(`  使用模型: ${options?.model || this.model}`);

            // 提供常见错误的解决建议
            if (statusCode === 404) {
                console.error('\n提示: 404 错误可能的原因:');
                console.error('  1. API 端点路径不正确（baseURL 不应包含 /v1）');
                console.error('  2. 模型名称不正确，请检查提供商支持的模型列表');
                console.error('  3. API Key 无效或未设置');
            } else if (statusCode === 401) {
                console.error('\n提示: 401 错误表示认证失败，请检查 API Key 是否正确');
            }

            throw error;
        }
    }

    /**
     * 流式响应消息
     */
    async* streamMessage(
        message: string,
        conversationHistory: Anthropic.MessageParam[] = [],
        options?: { model?: ClaudeModelName | string; maxTokens?: number; temperature?: number }
    ): AsyncGenerator<string, void, unknown> {
        try {
            const model = options?.model || this.model;
            const maxTokens = options?.maxTokens || this.maxTokens;
            const temperature = options?.temperature ?? this.temperature;

            const stream = this.client.messages.stream({
                model,
                max_tokens: maxTokens,
                temperature,
                system: this.systemPrompt,
                messages: [
                    ...conversationHistory,
                    {
                        role: 'user',
                        content: message,
                    },
                ],
            });

            for await (const chunk of stream) {
                if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                    yield chunk.delta.text;
                }
            }
        } catch (error: any) {
            // 提供更详细的错误信息
            const errorMessage = error?.message || '未知错误';
            const statusCode = error?.status || error?.statusCode;

            console.error('流式调用 API 时出错:');
            console.error(`  错误信息: ${errorMessage}`);
            if (statusCode) {
                console.error(`  HTTP 状态码: ${statusCode}`);
            }
            if (this.baseURL) {
                console.error(`  API 端点: ${this.baseURL}`);
            }
            console.error(`  使用模型: ${options?.model || this.model}`);

            throw error;
        }
    }

    /**
     * 设置系统提示词
     */
    setSystemPrompt(prompt: string): void {
        this.systemPrompt = prompt;
    }

    /**
     * 设置模型
     */
    setModel(model: ClaudeModelName | string): void {
        this.model = model;
        // 如果是已知模型，更新 maxTokens 为模型默认值
        const modelInfo = getModelInfo(model as ClaudeModelName);
        if (modelInfo) {
            this.maxTokens = modelInfo.maxTokens;
        }
    }

    /**
     * 获取当前模型
     */
    getModel(): ClaudeModelName | string {
        return this.model;
    }

    /**
     * 获取当前使用的 API 端点
     */
    getBaseURL(): string | undefined {
        return this.baseURL;
    }

    /**
     * 设置最大 token 数
     */
    setMaxTokens(maxTokens: number): void {
        this.maxTokens = maxTokens;
    }

    /**
     * 设置温度
     */
    setTemperature(temperature: number): void {
        this.temperature = temperature;
    }
}


/**
 * 主函数 - 示例用法
 */
async function main() {
    // 检查 API Key
//   if (!process.env.ANTHROPIC_API_KEY) {
//     console.error('错误: 请设置 ANTHROPIC_API_KEY 环境变量');
//     process.exit(1);
//   }

    // 创建 Agent 实例 - 使用默认模型
//   const agent = new ClaudeAgent({
//     systemPrompt: '你是一个专业的 AI 助手，能够帮助用户解决各种问题。',
//     model: DEFAULT_MODEL,
//   });


    //
    // console.log('🤖 Claude Agent 已启动\n');
    // console.log(`当前使用模型: ${agent.getModel()}\n`);
    // console.log('输入 "exit" 或 "quit" 退出\n');
    //
    // // 示例 1: 简单对话
    // console.log('=== 示例 1: 简单对话 ===');
    // const response1 = await agent.sendMessage('你好，请介绍一下你自己。');
    // console.log('Agent:', response1);
    // console.log('\n');

    // 示例 2: 流式响应
    // console.log('=== 示例 2: 流式响应 ===');
    // console.log('Agent: ');
    // for await (const chunk of agent.streamMessage('请用一句话介绍人工智能。')) {
    //     process.stdout.write(chunk);
    // }
    // console.log('\n\n');

    // 示例 3: 多轮对话
    // console.log('=== 示例 3: 多轮对话 ===');
    // const history: Anthropic.MessageParam[] = [];
    //
    // const msg1 = '什么是 TypeScript？';
    // const reply1 = await agent.sendMessage(msg1, history);
    // console.log('用户:', msg1);
    // console.log('Agent:', reply1);
    // console.log('\n');
    //
    // history.push({role: 'user', content: msg1});
    // history.push({role: 'assistant', content: reply1});
    //
    // const msg2 = '它和 JavaScript 有什么区别？';
    // const reply2 = await agent.sendMessage(msg2, history);
    // console.log('用户:', msg2);
    // console.log('Agent:', reply2);
    // console.log('\n');

    // 示例 4: 使用不同模型
    // console.log('=== 示例 4: 切换模型 ===');
    // agent.setModel('claude-3-haiku-20240307');
    // console.log(`切换到模型: ${agent.getModel()}`);
    // const response3 = await agent.sendMessage('用一句话解释什么是 AI。');
    // console.log('Agent:', response3);
    // console.log('\n');

    // 从用户输入获取文字


    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })


    rl.on('line', (line) => {
        const agent = new ClaudeAgent({
            systemPrompt: '你是一个专业的 AI 助手，能够帮助用户解决各种问题',
            // model: 'qwen-plus',
            // model: 'qwen-flash-character',
            // model: 'qwen3-tts-instruct-flash-realtime',
            model: 'qwen3-max',
            baseURL: 'https://dashscope.aliyuncs.com/apps/anthropic', // 注意：不要包含 /v1，SDK 会自动添加
            apiKey: process.env.DASHSCOPE_API_KEY,
        })
        agent.sendMessage(line).then(res => {
            console.log(res);
        })
    })

    rl.on('close', () => {
        rl.close()
    })



}

// 运行主函数
main().catch(console.error);