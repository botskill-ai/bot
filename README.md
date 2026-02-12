# 🤖 Multi-Model AI Bot

支持多个大模型接入的智能对话 Bot，基于 TypeScript 开发，提供交互式控制台 REPL。

## ✨ 功能特性

- 🔌 **多提供商支持** - OpenAI、Claude、百炼、DeepSeek、Moonshot、智谱、硅基流动、OpenRouter、Ollama
- 🔄 **运行时切换** - 随时切换提供商和模型，无需重启
- 📡 **流式响应** - 实时流式输出，打字机效果
- 💬 **多轮对话** - 自动管理对话历史
- 🎨 **彩色控制台** - 美观的终端界面
- 🔧 **丰富命令** - 内置多个交互命令
- 🏗️ **模块化设计** - 易于扩展新的提供商
- 📦 **TypeScript** - 完整的类型安全

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp env.example.txt .env
```

在 `.env` 文件中配置你要使用的提供商的 API Key（至少配置一个）：

```bash
# OpenAI
OPENAI_API_KEY=sk-xxxxx

# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-xxxxx

# 阿里云百炼
DASHSCOPE_API_KEY=sk-xxxxx

# DeepSeek
DEEPSEEK_API_KEY=sk-xxxxx

# 更多提供商参见 env.example.txt
```

### 3. 启动 Bot

```bash
npm run dev
```

## 📋 交互命令

启动后在控制台中使用以下命令：

| 命令 | 缩写 | 说明 |
|------|------|------|
| `/providers` | `/p` | 列出所有可用提供商 |
| `/switch <id>` | `/s` | 切换提供商 |
| `/models` | `/m` | 列出当前提供商可用模型 |
| `/model <name>` | `/md` | 切换模型 |
| `/system <prompt>` | - | 设置/查看系统提示词 |
| `/clear` | `/c` | 清除对话历史 |
| `/info` | `/i` | 显示当前配置信息 |
| `/history` | `/h` | 查看对话历史 |
| `/help` | - | 显示帮助信息 |
| `/exit` | `/q` | 退出程序 |

## 🔌 支持的提供商

| 提供商 | ID | 默认模型 | API Key 环境变量 |
|--------|-----|----------|-----------------|
| OpenAI | `openai` | gpt-4o | `OPENAI_API_KEY` |
| Anthropic Claude | `anthropic` | claude-sonnet-4-20250514 | `ANTHROPIC_API_KEY` |
| 阿里云百炼 | `dashscope` | qwen-plus | `DASHSCOPE_API_KEY` |
| DeepSeek | `deepseek` | deepseek-chat | `DEEPSEEK_API_KEY` |
| 月之暗面 Kimi | `moonshot` | moonshot-v1-8k | `MOONSHOT_API_KEY` |
| 智谱 AI | `zhipu` | glm-4-plus | `ZHIPU_API_KEY` |
| 硅基流动 | `siliconflow` | DeepSeek-V3 | `SILICONFLOW_API_KEY` |
| OpenRouter | `openrouter` | gpt-4o | `OPENROUTER_API_KEY` |
| Ollama (本地) | `ollama` | llama3 | `OLLAMA_ENABLED=true` |

## 📁 项目结构

```
src/
├── index.ts              # 主入口 - 交互式控制台 REPL
├── types.ts              # 核心类型定义
├── agent.ts              # Agent 统一封装（对话管理、提供商切换）
├── conversation.ts       # 对话历史管理
└── providers/
    ├── base.ts           # Provider 抽象基类
    ├── openai.ts         # OpenAI 兼容 Provider（适用于大部分服务）
    ├── anthropic.ts      # Anthropic Claude Provider
    ├── registry.ts       # 提供商注册表
    └── index.ts          # 统一导出
```

## 🏗️ 架构设计

```
┌─────────────────────────────┐
│       Interactive REPL      │  ← 控制台交互层
│        (index.ts)           │
├─────────────────────────────┤
│          Agent              │  ← 业务逻辑层（对话管理、流式输出）
│        (agent.ts)           │
├─────────────────────────────┤
│     ProviderRegistry        │  ← 提供商管理层
│      (registry.ts)          │
├──────────┬──────────────────┤
│ OpenAI   │   Anthropic      │  ← 具体提供商实现
│ Provider │   Provider       │
│          │                  │
│ (适用于 OpenAI, DashScope,  │
│  DeepSeek, Moonshot, 智谱,  │
│  硅基流动, Ollama 等)       │
└──────────┴──────────────────┘
```

**核心设计思路：**

- **OpenAI 兼容**：大部分国内外大模型服务都兼容 OpenAI 的 Chat Completions API，因此使用一个 `OpenAIProvider` 即可接入大量服务，仅需配置不同的 `baseURL` 和 `apiKey`。
- **Anthropic 独立**：Claude 使用独有的 Messages API 格式，因此使用专门的 `AnthropicProvider`。
- **注册表模式**：所有提供商统一注册，支持运行时动态切换。

## 🔧 扩展新提供商

### 方式一：使用 OpenAI 兼容接口（推荐）

大部分提供商都兼容 OpenAI API，只需在 `index.ts` 的 `setupProviders()` 中添加注册代码：

```typescript
if (process.env.YOUR_API_KEY) {
  registry.register('your-provider', new OpenAIProvider({
    apiKey: process.env.YOUR_API_KEY,
    baseURL: 'https://api.your-provider.com/v1',
    defaultModel: 'your-default-model',
    name: '你的提供商',
    id: 'your-provider',
    models: [
      { id: 'model-1', name: 'Model 1', description: '描述' },
    ],
  }));
}
```

### 方式二：实现自定义 Provider

如果提供商使用独特的 API 格式，可以继承 `BaseProvider`：

```typescript
import { BaseProvider } from './providers/base.js';

export class CustomProvider extends BaseProvider {
  readonly name = 'Custom Provider';
  readonly id = 'custom';

  async sendMessage(messages, systemPrompt, options) { /* ... */ }
  async *streamMessage(messages, systemPrompt, options) { /* ... */ }
  getModels() { return []; }
}
```

## 📜 依赖

| 包名 | 用途 |
|------|------|
| `openai` | OpenAI 及兼容 API 的 SDK |
| `@anthropic-ai/sdk` | Anthropic Claude SDK |
| `dotenv` | 环境变量管理 |
| `tsx` | TypeScript 运行/热重载 |

## 许可证

MIT
