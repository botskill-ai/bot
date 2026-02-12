import {
  ProviderRegistry,
  OpenAIProvider,
  AnthropicProvider,
} from './providers/index.js';
import { Conversation } from './conversation.js';
import { SendOptions } from './types.js';

/**
 * Agent - 统一的 AI 对话代理
 * 封装提供商切换、对话管理、消息发送等功能
 */
export class Agent {
  private registry: ProviderRegistry;
  private conversation: Conversation;
  private systemPrompt: string;

  constructor(registry: ProviderRegistry, options?: { systemPrompt?: string; maxHistory?: number }) {
    this.registry = registry;
    this.conversation = new Conversation(options?.maxHistory);
    this.systemPrompt = options?.systemPrompt || '你是一个有用的 AI 助手。请用中文回答问题。';
  }

  /** 发送消息（非流式） */
  async chat(message: string, options?: SendOptions): Promise<string> {
    const provider = this.registry.getCurrent();
    if (!provider) {
      throw new Error('没有可用的提供商，请检查 API Key 配置');
    }

    this.conversation.addUserMessage(message);

    try {
      const response = await provider.sendMessage(
        this.conversation.getMessages(),
        this.systemPrompt,
        options
      );
      this.conversation.addAssistantMessage(response);
      return response;
    } catch (error) {
      // 发送失败时移除刚添加的用户消息
      this.conversation.clear();
      throw error;
    }
  }

  /** 流式发送消息 */
  async *chatStream(
    message: string,
    options?: SendOptions
  ): AsyncGenerator<string, void, unknown> {
    const provider = this.registry.getCurrent();
    if (!provider) {
      throw new Error('没有可用的提供商，请检查 API Key 配置');
    }

    this.conversation.addUserMessage(message);
    let fullResponse = '';

    try {
      for await (const chunk of provider.streamMessage(
        this.conversation.getMessages(),
        this.systemPrompt,
        options
      )) {
        fullResponse += chunk;
        yield chunk;
      }
      this.conversation.addAssistantMessage(fullResponse);
    } catch (error) {
      // 如果已经收到部分响应，仍然保存
      if (fullResponse) {
        this.conversation.addAssistantMessage(fullResponse);
      }
      throw error;
    }
  }

  /** 清除对话历史 */
  clearHistory(): void {
    this.conversation.clear();
  }

  /** 获取对话历史长度 */
  getHistoryLength(): number {
    return this.conversation.getLength();
  }

  /** 获取对话历史 */
  getHistory() {
    return this.conversation.getMessages();
  }

  /** 获取系统提示词 */
  getSystemPrompt(): string {
    return this.systemPrompt;
  }

  /** 设置系统提示词 */
  setSystemPrompt(prompt: string): void {
    this.systemPrompt = prompt;
  }

  /** 获取提供商注册表 */
  getRegistry(): ProviderRegistry {
    return this.registry;
  }

  /** 切换提供商 */
  switchProvider(id: string): boolean {
    if (this.registry.setCurrent(id)) {
      this.conversation.clear(); // 切换提供商时清除历史
      return true;
    }
    return false;
  }

  /** 切换模型 */
  switchModel(model: string): void {
    const provider = this.registry.getCurrent();
    if (provider) {
      provider.setDefaultModel(model);
    }
  }

  /** 获取当前提供商名称 */
  getCurrentProviderName(): string {
    return this.registry.getCurrent()?.name || '未知';
  }

  /** 获取当前模型名称 */
  getCurrentModel(): string {
    return this.registry.getCurrent()?.getDefaultModel() || '未知';
  }
}
