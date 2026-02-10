import Anthropic from '@anthropic-ai/sdk';

/**
 * 高级 Agent 类 - 支持工具调用和复杂对话
 */
export class AdvancedClaudeAgent {
  private client: Anthropic;
  private systemPrompt: string;
  private conversationHistory: Anthropic.MessageParam[];

  constructor(apiKey: string, systemPrompt?: string) {
    this.client = new Anthropic({ apiKey });
    this.systemPrompt = systemPrompt || '你是一个有用的 AI 助手。';
    this.conversationHistory = [];
  }

  /**
   * 发送消息
   */
  async sendMessage(
    message: string,
    options?: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
      tools?: Anthropic.Tool[];
    }
  ): Promise<Anthropic.Message> {
    try {
      const response = await this.client.messages.create({
        model: options?.model || 'claude-3-5-sonnet-20241022',
        max_tokens: options?.maxTokens || 1024,
        temperature: options?.temperature,
        system: this.systemPrompt,
        tools: options?.tools,
        messages: [
          ...this.conversationHistory,
          {
            role: 'user',
            content: message,
          },
        ],
      });

      // 更新对话历史
      this.conversationHistory.push({ role: 'user', content: message });
      this.conversationHistory.push({
        role: 'assistant',
        content: response.content,
      });

      return response;
    } catch (error) {
      console.error('发送消息时出错:', error);
      throw error;
    }
  }

  /**
   * 流式发送消息
   */
  async *streamMessage(
    message: string,
    options?: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
      tools?: Anthropic.Tool[];
    }
  ): AsyncGenerator<Anthropic.MessageStreamEvent, void, unknown> {
    try {
      const stream = await this.client.messages.stream({
        model: options?.model || 'claude-3-5-sonnet-20241022',
        max_tokens: options?.maxTokens || 1024,
        temperature: options?.temperature,
        system: this.systemPrompt,
        tools: options?.tools,
        messages: [
          ...this.conversationHistory,
          {
            role: 'user',
            content: message,
          },
        ],
      });

      for await (const event of stream) {
        yield event;
      }

      // 更新对话历史
      const finalMessage = await stream.finalMessage();
      this.conversationHistory.push({ role: 'user', content: message });
      this.conversationHistory.push({
        role: 'assistant',
        content: finalMessage.content,
      });
    } catch (error) {
      console.error('流式发送消息时出错:', error);
      throw error;
    }
  }

  /**
   * 清除对话历史
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * 获取对话历史
   */
  getHistory(): Anthropic.MessageParam[] {
    return [...this.conversationHistory];
  }

  /**
   * 设置系统提示词
   */
  setSystemPrompt(prompt: string): void {
    this.systemPrompt = prompt;
  }

  /**
   * 获取系统提示词
   */
  getSystemPrompt(): string {
    return this.systemPrompt;
  }
}
