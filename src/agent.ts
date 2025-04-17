let ChatManager: any;
let ollamaConfig: any;
let chatManager: any;

async function initChatManager() {
  if (!ChatManager || !ollamaConfig) {
    const mod1 = await import('../mcp-ollama-agent/src/lib/ChatManager');
    const mod2 = await import('../mcp-ollama-agent/src/config');

    ChatManager = mod1.ChatManager;
    ollamaConfig = mod2.ollamaConfig;
  }

  //  初始化 ChatManager 實例
  if (!chatManager) {
    chatManager = new ChatManager(ollamaConfig);
    await chatManager.initialize();
  }
}

export async function runAgent(input: string): Promise<string> {
  try {
    await initChatManager();

    if (!chatManager) throw new Error("ChatManager 初始化失敗");

    const result = await chatManager.processUserInput(input);

    // 如果 result 是字串，直接回傳（你需要這樣設計 ChatManager 裡的 processUserInput）
    if (typeof result === 'string') return result;

    // 否則 fallback
    return ' AI 已處理（但無回傳內容）';
  } catch (err) {
    console.error("MCP Agent 執行錯誤：", err);
    return "⚠️ MCP Agent 回覆失敗，請稍後再試。";
  }
}
