import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import { ClaudeAgent } from '../index.js';
import { listAvailableModels, ClaudeModelName } from '../models.js';

dotenv.config();

/**
 * 模型对比示例 - 展示不同模型的表现
 */
async function modelComparisonExample() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('错误: 请设置 ANTHROPIC_API_KEY 环境变量');
    return;
  }

  console.log('=== Claude 模型对比示例 ===\n');

  // 列出所有可用模型
  const models = listAvailableModels();
  console.log('可用模型列表:');
  models.forEach((model) => {
    console.log(`  - ${model.id}: ${model.name} - ${model.description}`);
  });
  console.log('\n');

  // 测试问题
  const testQuestion = '请用一句话解释什么是人工智能，并说明它的主要应用领域。';

  // 测试不同的模型
  const testModels: ClaudeModelName[] = [
    'claude-3-5-sonnet-20241022',
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307',
  ];

  console.log(`测试问题: ${testQuestion}\n`);
  console.log('='.repeat(60));

  for (const modelId of testModels) {
    try {
      console.log(`\n📌 测试模型: ${modelId}`);
      const agent = new ClaudeAgent({
        systemPrompt: '你是一个专业的 AI 助手。',
        model: modelId,
      });

      const startTime = Date.now();
      const response = await agent.sendMessage(testQuestion);
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`⏱️  响应时间: ${duration}ms`);
      console.log(`💬 响应内容: ${response.substring(0, 200)}...`);
    } catch (error) {
      console.error(`❌ 模型 ${modelId} 调用失败:`, error);
    }
    console.log('-'.repeat(60));
  }
}

// 运行示例
modelComparisonExample().catch(console.error);
