import { ChatMessage } from './types.js';

/**
 * 对话历史管理
 */
export class Conversation {
    private messages: ChatMessage[] = [];
    private maxHistory: number;

    constructor(maxHistory: number = 50) {
        this.maxHistory = maxHistory;
    }

    /** 添加用户消息 */
    addUserMessage(content: string): void {
        this.messages.push({ role: 'user', content });
        this.trimHistory();
    }

    /** 添加助手消息 */
    addAssistantMessage(content: string): void {
        this.messages.push({ role: 'assistant', content });
        this.trimHistory();
    }

    /** 获取所有消息（副本） */
    getMessages(): ChatMessage[] {
        return [...this.messages];
    }

    /** 清除对话历史 */
    clear(): void {
        this.messages = [];
    }

    /** 获取消息数量 */
    getLength(): number {
        return this.messages.length;
    }

    /** 获取最近 N 条消息 */
    getRecent(n: number): ChatMessage[] {
        return this.messages.slice(-n);
    }

    /** 修剪历史记录，保持在上限内 */
    private trimHistory(): void {
        // 保留最大轮数 * 2（每轮一问一答）
        const maxMessages = this.maxHistory * 2;
        if (this.messages.length > maxMessages) {
            this.messages = this.messages.slice(-maxMessages);
        }
    }
}
