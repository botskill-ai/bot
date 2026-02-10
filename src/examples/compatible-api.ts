import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import { ClaudeAgent } from '../index.js';
import { Providers, createCustomProvider } from '../providers.js';

dotenv.config();

/**
 * 兼容 API 使用示例
 */
async function compatibleApiExample() {
  console.log('=== 兼容 API 使用示例 ===\n');

  // 示例 1: 使用阿里云百炼
  console.log('📌 示例 1: 使用阿里云百炼 (DashScope)\n');
  
  const dashscopeApiKey = process.env.DASHSCOPE_API_KEY;
  if (dashscopeApiKey) {
    try {
      const dashscopeAgent = new ClaudeAgent({
        systemPrompt: '你是一个专业的 AI 助手。',
        provider: 'dashscope',
        apiKey: dashscopeApiKey,
        model: 'qwen-plus', // 使用百炼的模型名称
        maxTokens: 2048,
      });

      console.log(`API 端点: ${dashscopeAgent.getBaseURL()}`);
      console.log(`使用模型: ${dashscopeAgent.getModel()}\n`);

      const response1 = await dashscopeAgent.sendMessage('你好，请介绍一下你自己。');
      console.log('Agent 响应:', response1);
      console.log('\n');
    } catch (error) {
      console.error('调用百炼 API 失败:', error);
      console.log('提示: 请确保已设置 DASHSCOPE_API_KEY 环境变量\n');
    }
  } else {
    console.log('提示: 请设置 DASHSCOPE_API_KEY 环境变量以使用阿里云百炼\n');
  }

  // 示例 2: 使用自定义提供商
  console.log('📌 示例 2: 使用自定义提供商配置\n');

  const customProvider = createCustomProvider(
    '我的自定义服务',
    'https://api.example.com/v1',
    {
      apiKeyHeader: 'Authorization',
      apiKeyFormat: 'bearer',
      description: '自定义兼容 Claude API 的服务',
      models: ['custom-model-1', 'custom-model-2'],
    }
  );

  const customApiKey = process.env.CUSTOM_API_KEY;
  if (customApiKey) {
    try {
      const customAgent = new ClaudeAgent({
        systemPrompt: '你是一个专业的 AI 助手。',
        provider: customProvider,
        apiKey: customApiKey,
        model: 'custom-model-1',
      });

      console.log(`API 端点: ${customAgent.getBaseURL()}`);
      console.log(`使用模型: ${customAgent.getModel()}\n`);

      // 注意: 实际调用需要确保 API 端点可用
      // const response2 = await customAgent.sendMessage('你好');
      // console.log('Agent 响应:', response2);
      console.log('提示: 请确保自定义 API 端点可用\n');
    } catch (error) {
      console.error('调用自定义 API 失败:', error);
    }
  } else {
    console.log('提示: 请设置 CUSTOM_API_KEY 环境变量以使用自定义服务\n');
  }

  // 示例 3: 直接指定 baseURL
  console.log('📌 示例 3: 直接指定 baseURL\n');

  const directApiKey = process.env.COMPATIBLE_API_KEY;
  if (directApiKey) {
    try {
      const directAgent = new ClaudeAgent({
        systemPrompt: '你是一个专业的 AI 助手。',
        baseURL: 'https://your-compatible-api.com/v1',
        apiKey: directApiKey,
        model: 'claude-3-5-sonnet-20241022', // 或兼容服务的模型名称
      });

      console.log(`API 端点: ${directAgent.getBaseURL()}`);
      console.log(`使用模型: ${directAgent.getModel()}\n`);

      // 注意: 实际调用需要确保 API 端点可用
      // const response3 = await directAgent.sendMessage('你好');
      // console.log('Agent 响应:', response3);
      console.log('提示: 请确保 API 端点可用且兼容 Claude API 格式\n');
    } catch (error) {
      console.error('调用直接配置的 API 失败:', error);
    }
  } else {
    console.log('提示: 请设置 COMPATIBLE_API_KEY 环境变量\n');
  }

  // 示例 4: 列出所有提供商
  console.log('📌 示例 4: 可用的提供商列表\n');
  Object.entries(Providers).forEach(([id, config]) => {
    console.log(`  ${id}:`);
    console.log(`    名称: ${config.name}`);
    console.log(`    端点: ${config.baseURL}`);
    if (config.description) {
      console.log(`    说明: ${config.description}`);
    }
    if (config.models && config.models.length > 0) {
      console.log(`    模型: ${config.models.join(', ')}`);
    }
    console.log('');
  });
}

// 运行示例
compatibleApiExample().catch(console.error);
