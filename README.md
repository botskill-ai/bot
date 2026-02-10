# Claude Agent 项目

基于 Anthropic Claude SDK 构建的 AI Agent 项目，支持对话、流式响应和工具调用。

## 功能特性

- ✅ 基础对话功能
- ✅ 流式响应支持
- ✅ 多轮对话历史管理
- ✅ 工具调用（Tool Use）支持
- ✅ **多模型支持** - 支持所有 Claude 模型（3.5 Sonnet、3 Opus、3 Sonnet、3 Haiku 等）
- ✅ **兼容 API 支持** - 支持阿里云百炼、千问等兼容 Claude API 的服务
- ✅ **自定义 API 端点** - 支持配置自定义 baseURL
- ✅ TypeScript 类型安全
- ✅ 模块化设计

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填入你的 API Key：

```bash
cp .env.example .env
```

在 `.env` 文件中设置：

```
# Anthropic 官方 API
ANTHROPIC_API_KEY=your_api_key_here

# 阿里云百炼 API (可选)
DASHSCOPE_API_KEY=your_dashscope_key

# 其他兼容 API (可选)
COMPATIBLE_API_KEY=your_compatible_key
```

你可以从以下位置获取 API Key：
- [Anthropic Console](https://console.anthropic.com/) - Anthropic 官方 API
- [阿里云百炼](https://dashscope.aliyun.com/) - 阿里云百炼平台

### 3. 运行项目

**开发模式（自动重新编译）：**
```bash
npm run dev
```

**生产模式：**
```bash
npm run build
npm start
```

## 项目结构

```
.
├── src/
│   ├── index.ts          # 主入口文件，包含基础示例
│   ├── agent.ts          # 高级 Agent 类
│   ├── models.ts         # 模型定义和配置
│   ├── providers.ts      # API 提供商配置（支持兼容 API）
│   └── examples/
│       ├── tool-use.ts   # 工具使用示例
│       ├── model-comparison.ts  # 模型对比示例
│       └── compatible-api.ts    # 兼容 API 使用示例
├── dist/                 # 编译输出目录
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 使用示例

### 基础对话

```typescript
import { ClaudeAgent } from './src/index.js';

const agent = new ClaudeAgent();
const response = await agent.sendMessage('你好！');
console.log(response);
```

### 选择不同的模型

```typescript
import { ClaudeAgent } from './src/index.js';

// 方式 1: 创建时指定模型
const agent = new ClaudeAgent({
  systemPrompt: '你是一个专业的助手',
  model: 'claude-3-opus-20240229', // 使用 Claude 3 Opus
  maxTokens: 4096,
});

// 方式 2: 运行时切换模型
agent.setModel('claude-3-haiku-20240307'); // 切换到 Haiku（更快更便宜）

// 方式 3: 单次调用指定模型
const response = await agent.sendMessage('你好', [], {
  model: 'claude-3-sonnet-20240229',
});
```

### 可用模型列表

项目支持以下 Claude 模型：

- **claude-3-5-sonnet-20241022** (默认) - 最新最强模型
- **claude-3-opus-20240229** - 最强大的模型，适合复杂任务
- **claude-3-sonnet-20240229** - 平衡性能和速度
- **claude-3-haiku-20240307** - 最快最经济的模型

查看 `src/models.ts` 获取完整模型列表和详细信息。

### 流式响应

```typescript
for await (const chunk of agent.streamMessage('请介绍一下 AI')) {
  process.stdout.write(chunk);
}
```

### 工具调用

查看 `src/examples/tool-use.ts` 了解如何使用工具调用功能。

### 模型对比

查看 `src/examples/model-comparison.ts` 了解如何对比不同模型的表现。

### 使用兼容 API（阿里云百炼、千问等）

```typescript
import { ClaudeAgent } from './src/index.js';

// 方式 1: 使用预定义的提供商
const dashscopeAgent = new ClaudeAgent({
  systemPrompt: '你是一个专业的助手',
  provider: 'dashscope', // 或 'qianwen'
  apiKey: process.env.DASHSCOPE_API_KEY,
  model: 'qwen-plus', // 使用百炼的模型名称
});

// 方式 2: 直接指定 baseURL
const customAgent = new ClaudeAgent({
  systemPrompt: '你是一个专业的助手',
  baseURL: 'https://your-compatible-api.com/v1',
  apiKey: process.env.COMPATIBLE_API_KEY,
  model: 'your-model-name',
});

// 方式 3: 使用自定义提供商配置
import { createCustomProvider } from './src/providers.js';

const customProvider = createCustomProvider(
  '我的服务',
  'https://api.example.com/v1',
  {
    apiKeyHeader: 'Authorization',
    apiKeyFormat: 'bearer',
  }
);

const agent = new ClaudeAgent({
  provider: customProvider,
  apiKey: process.env.CUSTOM_API_KEY,
  model: 'custom-model',
});
```

查看 `src/examples/compatible-api.ts` 了解完整的兼容 API 使用示例。

## API 文档

### ClaudeAgent

基础 Agent 类，提供简单的对话功能。

#### 方法

- `sendMessage(message: string, conversationHistory?: MessageParam[], options?: { model?, maxTokens?, temperature? }): Promise<string>`
  - 发送消息并获取响应，支持单次调用指定模型

- `streamMessage(message: string, conversationHistory?: MessageParam[], options?: { model?, maxTokens?, temperature? }): AsyncGenerator<string>`
  - 流式发送消息并获取响应，支持单次调用指定模型

- `setSystemPrompt(prompt: string): void`
  - 设置系统提示词

- `setModel(model: ClaudeModelName): void`
  - 设置使用的模型

- `getModel(): ClaudeModelName`
  - 获取当前使用的模型

- `setMaxTokens(maxTokens: number): void`
  - 设置最大 token 数

- `setTemperature(temperature: number): void`
  - 设置温度参数（控制随机性）

- `getBaseURL(): string | undefined`
  - 获取当前使用的 API 端点

#### 构造函数选项

- `apiKey?: string` - 自定义 API Key（默认使用环境变量）
- `baseURL?: string` - 自定义 API 端点
- `provider?: string | ProviderConfig` - 提供商 ID 或自定义配置

### 支持的提供商

项目预定义了以下提供商：

- **anthropic** - Anthropic 官方 API（默认）
- **dashscope** - 阿里云百炼平台
- **qianwen** - 阿里云通义千问

你也可以使用 `createCustomProvider()` 创建自定义提供商配置。

### AdvancedClaudeAgent

高级 Agent 类，支持工具调用和更灵活的配置。

#### 方法

- `sendMessage(message: string, options?: Options): Promise<Message>`
  - 发送消息，支持工具调用

- `streamMessage(message: string, options?: Options): AsyncGenerator<MessageStreamEvent>`
  - 流式发送消息

- `clearHistory(): void`
  - 清除对话历史

- `getHistory(): MessageParam[]`
  - 获取对话历史

- `setSystemPrompt(prompt: string): void`
  - 设置系统提示词

## 依赖

- `@anthropic-ai/sdk`: Anthropic 官方 SDK
- `dotenv`: 环境变量管理
- `typescript`: TypeScript 支持
- `tsx`: TypeScript 执行工具

## 许可证

MIT

## 参考资源

- [Anthropic Claude API 文档](https://docs.anthropic.com/)
- [Claude SDK GitHub](https://github.com/anthropics/anthropic-sdk-typescript)
