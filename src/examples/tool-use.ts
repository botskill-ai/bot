import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import { AdvancedClaudeAgent } from '../agent.js';

dotenv.config();

/**
 * 工具使用示例
 */
async function toolUseExample() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('错误: 请设置 ANTHROPIC_API_KEY 环境变量');
    return;
  }

  const agent = new AdvancedClaudeAgent(process.env.ANTHROPIC_API_KEY);

  // 定义工具
  const tools: Anthropic.Tool[] = [
    {
      name: 'get_weather',
      description: '获取指定城市的天气信息',
      input_schema: {
        type: 'object',
        properties: {
          city: {
            type: 'string',
            description: '城市名称',
          },
          unit: {
            type: 'string',
            enum: ['celsius', 'fahrenheit'],
            description: '温度单位',
          },
        },
        required: ['city'],
      },
    },
    {
      name: 'calculate',
      description: '执行数学计算',
      input_schema: {
        type: 'object',
        properties: {
          expression: {
            type: 'string',
            description: '要计算的数学表达式',
          },
        },
        required: ['expression'],
      },
    },
  ];

  // 工具实现函数
  const toolImplementations: Record<string, (args: any) => Promise<string>> = {
    get_weather: async (args: { city: string; unit?: string }) => {
      // 模拟天气 API 调用
      const unit = args.unit || 'celsius';
      const temp = Math.floor(Math.random() * 30) + 10;
      return `今天 ${args.city} 的天气是晴天，温度 ${temp}°${unit === 'celsius' ? 'C' : 'F'}`;
    },
    calculate: async (args: { expression: string }) => {
      try {
        // 注意：在生产环境中应该使用更安全的表达式求值方法
        const result = Function(`"use strict"; return (${args.expression})`)();
        return `计算结果: ${result}`;
      } catch (error) {
        return `计算错误: ${error instanceof Error ? error.message : '未知错误'}`;
      }
    },
  };

  console.log('=== 工具使用示例 ===\n');

  const userMessage = '请帮我查询北京的天气，然后计算 25 * 4 + 10 的结果。';

  console.log('用户:', userMessage);
  console.log('\nAgent 响应:\n');

  const response = await agent.sendMessage(userMessage, { tools });

  // 处理工具调用
  for (const contentBlock of response.content) {
    if (contentBlock.type === 'text') {
      console.log(contentBlock.text);
    } else if (contentBlock.type === 'tool_use') {
      console.log(`\n[调用工具: ${contentBlock.name}]`);
      const toolResult = await toolImplementations[contentBlock.name](
        contentBlock.input
      );

      // 发送工具结果回给 Claude
      const toolResponse = await agent.sendMessage(
        `工具 ${contentBlock.name} 的执行结果: ${toolResult}`
      );

      const textContent = toolResponse.content.find(
        (block): block is Anthropic.TextBlock => block.type === 'text'
      );
      if (textContent) {
        console.log(`\n${textContent.text}`);
      }
    }
  }
}

// 运行示例
toolUseExample().catch(console.error);
