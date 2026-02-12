import { BaseProvider } from './base.js';

/**
 * 提供商注册表
 * 管理所有已注册的 LLM 提供商，支持切换
 */
export class ProviderRegistry {
    private providers: Map<string, BaseProvider> = new Map();
    private currentId: string = '';

    /** 注册一个提供商 */
    register(id: string, provider: BaseProvider): void {
        this.providers.set(id, provider);
        // 第一个注册的自动设为当前
        if (!this.currentId) {
            this.currentId = id;
        }
    }

    /** 获取指定提供商 */
    get(id: string): BaseProvider | undefined {
        return this.providers.get(id);
    }

    /** 获取当前提供商 */
    getCurrent(): BaseProvider | undefined {
        return this.providers.get(this.currentId);
    }

    /** 获取当前提供商 ID */
    getCurrentId(): string {
        return this.currentId;
    }

    /** 切换当前提供商 */
    setCurrent(id: string): boolean {
        if (this.providers.has(id)) {
            this.currentId = id;
            return true;
        }
        return false;
    }

    /** 列出所有已注册提供商 */
    list(): Array<{ id: string; name: string; isCurrent: boolean }> {
        return Array.from(this.providers.entries()).map(([id, provider]) => ({
            id,
            name: provider.name,
            isCurrent: id === this.currentId,
        }));
    }

    /** 检查提供商是否存在 */
    has(id: string): boolean {
        return this.providers.has(id);
    }

    /** 获取已注册提供商数量 */
    size(): number {
        return this.providers.size;
    }
}
