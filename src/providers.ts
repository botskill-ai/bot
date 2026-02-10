/**
 * API 提供商配置
 * 支持兼容 Claude API 的第三方服务
 */

export interface ProviderConfig {
  name: string;
  baseURL: string;
  apiKeyHeader?: string; // 默认使用 'x-api-key' 或 'authorization'
  apiKeyFormat?: 'header' | 'bearer'; // API Key 格式
  description?: string;
  models?: string[]; // 支持的模型列表
}

/**
 * 预定义的 API 提供商配置
 */
export const Providers: Record<string, ProviderConfig> = {
  // Anthropic 官方
  anthropic: {
    name: 'Anthropic Claude',
    baseURL: 'https://api.anthropic.com',
    description: 'Anthropic 官方 API',
  },

  // 阿里云百炼 (DashScope)
  dashscope: {
    name: '阿里云百炼',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode',
    apiKeyHeader: 'Authorization',
    apiKeyFormat: 'bearer',
    description: '阿里云百炼平台，兼容 Claude API',
    models: ['qwen-plus', 'qwen-max', 'qwen-turbo', 'deepseek-v3', 'deepseek-v3.2'],
  },

  // 阿里千问 (通义千问)
  qianwen: {
    name: '阿里千问',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode',
    apiKeyHeader: 'Authorization',
    apiKeyFormat: 'bearer',
    description: '阿里云通义千问，兼容 Claude API',
    models: ['qwen-plus', 'qwen-max', 'qwen-turbo', 'qwen-7b-chat', 'qwen-14b-chat', 'deepseek-v3', 'deepseek-v3.2'],
  },

  // 其他兼容服务示例（需要根据实际情况配置）
  custom: {
    name: '自定义服务',
    baseURL: '', // 需要用户提供
    description: '自定义兼容 Claude API 的服务',
  },
};

/**
 * 获取提供商配置
 */
export function getProvider(providerId: string): ProviderConfig | undefined {
  return Providers[providerId];
}

/**
 * 列出所有提供商
 */
export function listProviders(): Array<{ id: string; config: ProviderConfig }> {
  return Object.entries(Providers).map(([id, config]) => ({ id, config }));
}

/**
 * 创建自定义提供商配置
 */
export function createCustomProvider(
  name: string,
  baseURL: string,
  options?: {
    apiKeyHeader?: string;
    apiKeyFormat?: 'header' | 'bearer';
    description?: string;
    models?: string[];
  }
): ProviderConfig {
  return {
    name,
    baseURL,
    apiKeyHeader: options?.apiKeyHeader || 'x-api-key',
    apiKeyFormat: options?.apiKeyFormat || 'header',
    description: options?.description,
    models: options?.models,
  };
}
