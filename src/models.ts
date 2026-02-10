/**
 * Claude 可用模型列表
 * 参考: https://docs.anthropic.com/claude/docs/models-overview
 */
export const ClaudeModels = {
  // Claude 3.5 系列
  'claude-3-5-sonnet-20241022': {
    name: 'Claude 3.5 Sonnet',
    description: '最新版本，性能最强，适合复杂任务',
    maxTokens: 8192,
  },
  'claude-3-5-sonnet-20240620': {
    name: 'Claude 3.5 Sonnet (旧版)',
    description: 'Claude 3.5 Sonnet 的早期版本',
    maxTokens: 8192,
  },

  // Claude 3 系列
  'claude-3-opus-20240229': {
    name: 'Claude 3 Opus',
    description: '最强大的模型，适合最复杂的任务',
    maxTokens: 4096,
  },
  'claude-3-sonnet-20240229': {
    name: 'Claude 3 Sonnet',
    description: '平衡性能和速度，适合大多数任务',
    maxTokens: 4096,
  },
  'claude-3-haiku-20240307': {
    name: 'Claude 3 Haiku',
    description: '最快最经济的模型，适合简单任务',
    maxTokens: 4096,
  },

  // Claude 2 系列（已弃用，但可能仍可用）
  'claude-2.1': {
    name: 'Claude 2.1',
    description: 'Claude 2 系列（已弃用）',
    maxTokens: 4096,
  },
  'claude-2.0': {
    name: 'Claude 2.0',
    description: 'Claude 2 系列（已弃用）',
    maxTokens: 4096,
  },
} as const;

/**
 * 模型名称类型
 */
export type ClaudeModelName = keyof typeof ClaudeModels;

/**
 * 默认模型
 */
export const DEFAULT_MODEL: ClaudeModelName = 'claude-3-5-sonnet-20241022';

/**
 * 获取模型信息
 */
export function getModelInfo(model: ClaudeModelName) {
  return ClaudeModels[model];
}

/**
 * 列出所有可用模型
 */
export function listAvailableModels() {
  return Object.entries(ClaudeModels).map(([key, value]) => ({
    id: key,
    ...value,
  }));
}
