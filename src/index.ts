import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import dotenv from 'dotenv';
import { ProviderRegistry, OpenAIProvider, AnthropicProvider } from './providers/index.js';
import { Agent } from './agent.js';

// 加载环境变量
dotenv.config();

// ═══════════════════════════════════════
// ANSI 颜色定义
// ═══════════════════════════════════════
const c = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    italic: '\x1b[3m',
    underline: '\x1b[4m',
    // 前景色
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m',
};

// ═══════════════════════════════════════
// 提供商初始化
// ═══════════════════════════════════════
function setupProviders(): ProviderRegistry {
    const registry = new ProviderRegistry();

    // OpenAI
    if (process.env.OPENAI_API_KEY) {
        registry.register(
            'openai',
            new OpenAIProvider({
                apiKey: process.env.OPENAI_API_KEY,
                baseURL: process.env.OPENAI_BASE_URL,
                defaultModel: process.env.OPENAI_MODEL || 'gpt-4o',
            })
        );
    }

    // Anthropic Claude
    if (process.env.ANTHROPIC_API_KEY) {
        registry.register(
            'anthropic',
            new AnthropicProvider({
                apiKey: process.env.ANTHROPIC_API_KEY,
                baseURL: process.env.ANTHROPIC_BASE_URL,
                defaultModel: process.env.ANTHROPIC_MODEL,
            })
        );
    }

    // 阿里云百炼 (DashScope) - 使用 OpenAI 兼容接口
    if (process.env.DASHSCOPE_API_KEY) {
        registry.register(
            'dashscope',
            new OpenAIProvider({
                apiKey: process.env.DASHSCOPE_API_KEY,
                baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
                defaultModel: process.env.DASHSCOPE_MODEL || 'qwen-plus',
                name: '阿里云百炼',
                id: 'dashscope',
                models: [
                    { id: 'qwen-plus', name: 'Qwen Plus', description: '通义千问增强版' },
                    { id: 'qwen-max', name: 'Qwen Max', description: '通义千问旗舰版' },
                    { id: 'qwen-turbo', name: 'Qwen Turbo', description: '通义千问极速版' },
                    { id: 'qwen-long', name: 'Qwen Long', description: '通义千问长文本' },
                    { id: 'deepseek-v3', name: 'DeepSeek V3', description: 'DeepSeek V3 模型' },
                    { id: 'deepseek-r1', name: 'DeepSeek R1', description: 'DeepSeek R1 推理模型' },
                ],
            })
        );
    }

    // DeepSeek
    if (process.env.DEEPSEEK_API_KEY) {
        registry.register(
            'deepseek',
            new OpenAIProvider({
                apiKey: process.env.DEEPSEEK_API_KEY,
                baseURL: 'https://api.deepseek.com',
                defaultModel: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
                name: 'DeepSeek',
                id: 'deepseek',
                models: [
                    { id: 'deepseek-chat', name: 'DeepSeek Chat', description: 'DeepSeek 对话模型 (V3)' },
                    { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', description: 'DeepSeek R1 推理模型' },
                ],
            })
        );
    }

    // 月之暗面 (Moonshot / Kimi)
    if (process.env.MOONSHOT_API_KEY) {
        registry.register(
            'moonshot',
            new OpenAIProvider({
                apiKey: process.env.MOONSHOT_API_KEY,
                baseURL: 'https://api.moonshot.cn/v1',
                defaultModel: process.env.MOONSHOT_MODEL || 'moonshot-v1-8k',
                name: '月之暗面 Kimi',
                id: 'moonshot',
                models: [
                    { id: 'moonshot-v1-8k', name: 'Moonshot V1 8K', description: '8K 上下文窗口' },
                    { id: 'moonshot-v1-32k', name: 'Moonshot V1 32K', description: '32K 上下文窗口' },
                    { id: 'moonshot-v1-128k', name: 'Moonshot V1 128K', description: '128K 上下文窗口' },
                ],
            })
        );
    }

    // 智谱 AI (ChatGLM)
    if (process.env.ZHIPU_API_KEY) {
        registry.register(
            'zhipu',
            new OpenAIProvider({
                apiKey: process.env.ZHIPU_API_KEY,
                baseURL: 'https://open.bigmodel.cn/api/paas/v4',
                defaultModel: process.env.ZHIPU_MODEL || 'glm-4-plus',
                name: '智谱 AI',
                id: 'zhipu',
                models: [
                    { id: 'glm-4-plus', name: 'GLM-4 Plus', description: '高智能旗舰模型' },
                    { id: 'glm-4-air', name: 'GLM-4 Air', description: '高性价比模型' },
                    { id: 'glm-4-flash', name: 'GLM-4 Flash', description: '免费极速模型' },
                    { id: 'glm-4-long', name: 'GLM-4 Long', description: '超长上下文模型' },
                ],
            })
        );
    }

    // SiliconFlow (硅基流动)
    if (process.env.SILICONFLOW_API_KEY) {
        registry.register(
            'siliconflow',
            new OpenAIProvider({
                apiKey: process.env.SILICONFLOW_API_KEY,
                baseURL: 'https://api.siliconflow.cn/v1',
                defaultModel: process.env.SILICONFLOW_MODEL || 'deepseek-ai/DeepSeek-V3',
                name: '硅基流动',
                id: 'siliconflow',
                models: [
                    { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek V3', description: 'DeepSeek V3' },
                    { id: 'deepseek-ai/DeepSeek-R1', name: 'DeepSeek R1', description: '推理模型' },
                    { id: 'Qwen/Qwen2.5-72B-Instruct', name: 'Qwen 2.5 72B', description: '通义千问 72B' },
                ],
            })
        );
    }

    // OpenRouter (统一网关，支持 200+ 模型)
    if (process.env.OPENROUTER_API_KEY) {
        registry.register(
            'openrouter',
            new OpenAIProvider({
                apiKey: process.env.OPENROUTER_API_KEY,
                baseURL: 'https://openrouter.ai/api/v1',
                defaultModel: process.env.OPENROUTER_MODEL || 'openai/gpt-4o',
                name: 'OpenRouter',
                id: 'openrouter',
                models: [
                    { id: 'openai/gpt-4o', name: 'GPT-4o', description: 'OpenAI GPT-4o' },
                    { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', description: 'OpenAI GPT-4o Mini' },
                    { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', description: 'Anthropic Claude Sonnet 4' },
                    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Anthropic Claude 3.5 Sonnet' },
                    { id: 'google/gemini-2.5-pro-preview', name: 'Gemini 2.5 Pro', description: 'Google Gemini 2.5 Pro' },
                    { id: 'google/gemini-2.5-flash-preview', name: 'Gemini 2.5 Flash', description: 'Google Gemini 2.5 Flash' },
                    { id: 'deepseek/deepseek-chat-v3-0324', name: 'DeepSeek V3', description: 'DeepSeek Chat V3' },
                    { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', description: 'DeepSeek R1 推理模型' },
                    { id: 'meta-llama/llama-4-maverick', name: 'Llama 4 Maverick', description: 'Meta Llama 4 Maverick' },
                    { id: 'mistralai/mistral-large-2411', name: 'Mistral Large', description: 'Mistral Large' },
                    { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B', description: '通义千问 2.5 72B' },
                ],
            })
        );
    }

    // Ollama (本地模型)
    if (process.env.OLLAMA_ENABLED === 'true') {
        registry.register(
            'ollama',
            new OpenAIProvider({
                apiKey: 'ollama', // Ollama 不需要真实 API Key
                baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1',
                defaultModel: process.env.OLLAMA_MODEL || 'llama3',
                name: 'Ollama (本地)',
                id: 'ollama',
                models: [
                    { id: 'llama3', name: 'Llama 3', description: 'Meta Llama 3' },
                    { id: 'qwen2.5', name: 'Qwen 2.5', description: '通义千问 2.5' },
                    { id: 'deepseek-r1', name: 'DeepSeek R1', description: 'DeepSeek R1' },
                    { id: 'mistral', name: 'Mistral', description: 'Mistral AI' },
                ],
            })
        );
    }

    return registry;
}

// ═══════════════════════════════════════
// 控制台输出工具
// ═══════════════════════════════════════
function printBanner(): void {
    console.log();
    console.log(`${c.cyan}${c.bold}  🤖 Multi-Model AI Bot${c.reset} ${c.dim}v2.0.0${c.reset}`);
    console.log(`${c.gray}  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`);
    console.log(`${c.dim}  支持多个大模型的智能对话助手${c.reset}`);
    console.log();
}

function printProviderList(agent: Agent): void {
    const providers = agent.getRegistry().list();
    if (providers.length === 0) {
        console.log(`${c.red}  ✗ 没有可用的提供商，请配置 API Key${c.reset}`);
        return;
    }

    console.log(`${c.bold}  已加载提供商:${c.reset}`);
    for (const p of providers) {
        const provider = agent.getRegistry().get(p.id);
        const model = provider?.getDefaultModel() || '';
        const marker = p.isCurrent ? `${c.green}▶` : `${c.gray} `;
        const name = p.isCurrent ? `${c.green}${c.bold}${p.name}${c.reset}` : `${c.white}${p.name}${c.reset}`;
        console.log(`  ${marker} ${name} ${c.dim}(${p.id})${c.reset} ${c.gray}· ${model}${c.reset}`);
    }
    console.log();
}

function printCurrentStatus(agent: Agent): void {
    const providerId = agent.getRegistry().getCurrentId();
    const providerName = agent.getCurrentProviderName();
    const model = agent.getCurrentModel();
    console.log(`${c.gray}  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`);
    console.log(`${c.dim}  当前: ${c.cyan}${providerName}${c.reset} ${c.dim}/ ${c.yellow}${model}${c.reset}`);
    console.log(`${c.dim}  输入 ${c.white}/help${c.dim} 查看可用命令${c.reset}`);
    console.log(`${c.gray}  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`);
    console.log();
}

function printHelp(): void {
    console.log();
    console.log(`${c.cyan}${c.bold}  📋 可用命令${c.reset}`);
    console.log(`${c.gray}  ──────────────────────────────────────${c.reset}`);
    console.log(`  ${c.yellow}/providers${c.reset} ${c.dim}(/p)${c.reset}        列出所有可用提供商`);
    console.log(`  ${c.yellow}/switch${c.reset} ${c.dim}<id>  (/s)${c.reset}     切换提供商`);
    console.log(`  ${c.yellow}/models${c.reset} ${c.dim}(/m)${c.reset}           列出当前提供商可用模型`);
    console.log(`  ${c.yellow}/model${c.reset} ${c.dim}<name>  (/md)${c.reset}   切换模型`);
    console.log(`  ${c.yellow}/system${c.reset} ${c.dim}<prompt>${c.reset}       设置系统提示词`);
    console.log(`  ${c.yellow}/clear${c.reset} ${c.dim}(/c)${c.reset}            清除对话历史`);
    console.log(`  ${c.yellow}/info${c.reset} ${c.dim}(/i)${c.reset}             显示当前配置信息`);
    console.log(`  ${c.yellow}/history${c.reset} ${c.dim}(/h)${c.reset}          查看对话历史`);
    console.log(`  ${c.yellow}/exit${c.reset} ${c.dim}(/q)${c.reset}             退出程序`);
    console.log(`${c.gray}  ──────────────────────────────────────${c.reset}`);
    console.log();
}

// ═══════════════════════════════════════
// 命令处理
// ═══════════════════════════════════════
function handleCommand(input: string, agent: Agent): boolean {
    const trimmed = input.trim();
    const [cmd, ...args] = trimmed.split(/\s+/);
    const arg = args.join(' ');

    switch (cmd) {
        case '/help':
            printHelp();
            return true;

        case '/providers':
        case '/p':
            printProviderList(agent);
            return true;

        case '/switch':
        case '/s': {
            if (!arg) {
                console.log(`${c.yellow}  用法: /switch <提供商ID>${c.reset}`);
                console.log(`${c.dim}  输入 /providers 查看可用提供商${c.reset}\n`);
                return true;
            }
            if (agent.switchProvider(arg)) {
                const provider = agent.getRegistry().getCurrent()!;
                console.log(
                    `${c.green}  ✓ 已切换到: ${c.bold}${provider.name}${c.reset} ${c.dim}(${provider.getDefaultModel()})${c.reset}\n`
                );
            } else {
                console.log(`${c.red}  ✗ 未找到提供商: ${arg}${c.reset}`);
                console.log(`${c.dim}  输入 /providers 查看可用提供商${c.reset}\n`);
            }
            return true;
        }

        case '/models':
        case '/m': {
            const provider = agent.getRegistry().getCurrent();
            if (!provider) {
                console.log(`${c.red}  ✗ 无当前提供商${c.reset}\n`);
                return true;
            }
            const models = provider.getModels();
            const currentModel = provider.getDefaultModel();
            console.log(`\n${c.cyan}${c.bold}  📦 ${provider.name} 可用模型${c.reset}`);
            console.log(`${c.gray}  ──────────────────────────────────────${c.reset}`);
            for (const m of models) {
                const isCurrent = m.id === currentModel;
                const marker = isCurrent ? `${c.green}▶` : `${c.gray} `;
                const name = isCurrent
                    ? `${c.green}${c.bold}${m.id}${c.reset}`
                    : `${c.white}${m.id}${c.reset}`;
                console.log(`  ${marker} ${name} ${c.dim}· ${m.description || m.name}${c.reset}`);
            }
            console.log();
            return true;
        }

        case '/model':
        case '/md': {
            if (!arg) {
                console.log(`${c.yellow}  用法: /model <模型名称>${c.reset}`);
                console.log(`${c.dim}  输入 /models 查看可用模型${c.reset}\n`);
                return true;
            }
            agent.switchModel(arg);
            console.log(`${c.green}  ✓ 已切换模型: ${c.bold}${arg}${c.reset}\n`);
            return true;
        }

        case '/system': {
            if (!arg) {
                console.log(`${c.cyan}  当前系统提示词:${c.reset}`);
                console.log(`${c.dim}  ${agent.getSystemPrompt()}${c.reset}\n`);
                return true;
            }
            agent.setSystemPrompt(arg);
            console.log(`${c.green}  ✓ 系统提示词已更新${c.reset}\n`);
            return true;
        }

        case '/clear':
        case '/c':
            agent.clearHistory();
            console.log(`${c.green}  ✓ 对话历史已清除${c.reset}\n`);
            return true;

        case '/info':
        case '/i': {
            const provider = agent.getRegistry().getCurrent();
            console.log(`\n${c.cyan}${c.bold}  ℹ️  当前配置${c.reset}`);
            console.log(`${c.gray}  ──────────────────────────────────────${c.reset}`);
            console.log(`  ${c.dim}提供商:${c.reset}   ${c.cyan}${agent.getCurrentProviderName()}${c.reset}`);
            console.log(`  ${c.dim}模型:${c.reset}     ${c.yellow}${agent.getCurrentModel()}${c.reset}`);
            console.log(`  ${c.dim}对话轮数:${c.reset} ${agent.getHistoryLength() / 2} 轮`);
            console.log(`  ${c.dim}系统提示:${c.reset} ${agent.getSystemPrompt().substring(0, 60)}${agent.getSystemPrompt().length > 60 ? '...' : ''}`);
            console.log();
            return true;
        }

        case '/history':
        case '/h': {
            const history = agent.getHistory();
            if (history.length === 0) {
                console.log(`${c.dim}  暂无对话历史${c.reset}\n`);
                return true;
            }
            console.log(`\n${c.cyan}${c.bold}  📜 对话历史 (${history.length / 2} 轮)${c.reset}`);
            console.log(`${c.gray}  ──────────────────────────────────────${c.reset}`);
            for (const msg of history) {
                const roleLabel =
                    msg.role === 'user'
                        ? `${c.blue}${c.bold}You${c.reset}`
                        : `${c.green}${c.bold}AI${c.reset}`;
                const content =
                    msg.content.length > 100
                        ? msg.content.substring(0, 100) + '...'
                        : msg.content;
                console.log(`  ${roleLabel} ${c.gray}›${c.reset} ${content}`);
            }
            console.log();
            return true;
        }

        case '/exit':
        case '/quit':
        case '/q':
            console.log(`\n${c.cyan}  再见！👋${c.reset}\n`);
            process.exit(0);

        default:
            console.log(`${c.yellow}  未知命令: ${cmd}${c.reset}`);
            console.log(`${c.dim}  输入 /help 查看可用命令${c.reset}\n`);
            return true;
    }
}

// ═══════════════════════════════════════
// 主函数
// ═══════════════════════════════════════
async function main(): Promise<void> {
    // 初始化提供商
    const registry = setupProviders();
    const agent = new Agent(registry);

    // 打印欢迎信息
    printBanner();
    printProviderList(agent);

    // 检查是否有可用提供商
    if (registry.size() === 0) {
        console.log(`${c.red}${c.bold}  ⚠️  没有配置任何 API Key！${c.reset}`);
        console.log(`${c.dim}  请在 .env 文件中配置至少一个提供商的 API Key${c.reset}`);
        console.log(`${c.dim}  参考 env.example.txt 了解配置方式${c.reset}\n`);
        process.exit(1);
    }

    printCurrentStatus(agent);

    // 创建 readline 接口
    const rl = readline.createInterface({ input, output });

    // 控制台交互循环
    while (true) {
        const providerId = registry.getCurrentId();
        const model = agent.getCurrentModel();
        // 简洁的提示符
        const prompt = `${c.blue}${c.bold}You${c.reset} ${c.gray}(${providerId}/${model})${c.reset} ${c.gray}›${c.reset} `;

        let userInput: string;
        try {
            userInput = await rl.question(prompt);
        } catch {
            // Ctrl+C 或 EOF
            console.log(`\n${c.cyan}  再见！👋${c.reset}\n`);
            break;
        }

        // 跳过空输入
        if (!userInput.trim()) continue;

        // 处理命令
        if (userInput.startsWith('/')) {
            handleCommand(userInput, agent);
            continue;
        }

        // 发送消息（流式输出）
        try {
            process.stdout.write(`\n${c.green}${c.bold}AI${c.reset}  ${c.gray}›${c.reset} `);

            const startTime = Date.now();
            let tokenCount = 0;

            for await (const chunk of agent.chatStream(userInput)) {
                process.stdout.write(chunk);
                tokenCount++;
            }

            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            process.stdout.write(`\n${c.dim}     [${elapsed}s]${c.reset}\n\n`);
        } catch (error: any) {
            const message = error?.message || String(error);
            console.log(`\n${c.red}  ✗ 错误: ${message}${c.reset}`);

            // 常见错误提示
            if (message.includes('401') || message.includes('Unauthorized') || message.includes('API key')) {
                console.log(`${c.dim}  请检查 API Key 是否正确配置${c.reset}`);
            } else if (message.includes('429') || message.includes('rate')) {
                console.log(`${c.dim}  请求过于频繁，请稍后再试${c.reset}`);
            } else if (message.includes('timeout') || message.includes('ECONNREFUSED')) {
                console.log(`${c.dim}  网络连接失败，请检查网络设置${c.reset}`);
            }
            console.log();
        }
    }

    rl.close();
}

// 启动
main().catch((err) => {
    console.error(`${c.red}启动失败: ${err.message}${c.reset}`);
    process.exit(1);
});