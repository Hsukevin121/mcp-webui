import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs-extra';
import path from 'path';
import { runAgent, resetChatManager } from './agent';  // ✅ 新增匯入 resetChatManager

const app = express();
const PORT = 3100;
const ollama_url = "192.168.31.129:11434";

const upload = multer({ dest: path.join(__dirname, '../uploads') });
const HISTORY_DIR = path.join(__dirname, '../');
const MAX_HISTORY_FILES = 5;

app.use(cors());
app.use(express.json());

// 對話 API
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: '缺少 message 參數' });

  const reply = await runAgent(message);
  await saveHistoryFile([{ user: message, assistant: reply }]);

  res.json({ reply });
});

// 儲存歷史檔案：最多 5 筆，使用 history1.json ~ history5.json
async function saveHistoryFile(messages: { user: string; assistant: string }[]) {
  const files = (await fs.readdir(HISTORY_DIR))
    .filter(f => /^history\d+\.json$/.test(f))
    .sort((a, b) => {
      const aNum = parseInt(a.match(/\d+/)![0]);
      const bNum = parseInt(b.match(/\d+/)![0]);
      return aNum - bNum;
    });

  // 超過 5 筆就刪除最舊的
  if (files.length >= MAX_HISTORY_FILES) {
    await fs.remove(path.join(HISTORY_DIR, files[0]));
  }

  // 找下一個編號
  let nextIndex = 1;
  while (files.includes(`history${nextIndex}.json`)) nextIndex++;

  const newFile = path.join(HISTORY_DIR, `history${nextIndex}.json`);
  await fs.writeJSON(newFile, messages, { spaces: 2 });
}

// 工具列表
app.get('/api/tools', async (_, res) => {
  try {
    const configPath = path.join(__dirname, '../mcp-ollama-agent/mcp-config.json');
    const config = await fs.readJSON(configPath);
    const tools = Object.keys(config.mcpServers || {});
    res.json({ tools });
  } catch (err) {
    console.error('讀取 MCP 設定錯誤：', err);
    res.status(500).json({ error: '無法取得工具清單' });
  }
});

// 模型列表
app.get('/api/models', async (_, res) => {
  try {
    const response = await fetch(`http://${ollama_url}/api/tags`);
    const data = await response.json();
    const models = data.models.map((m: any) => m.name);
    res.json({ models });
  } catch (err) {
    console.error('取得模型清單錯誤：', err);
    res.status(500).json({ error: '無法取得模型清單' });
  }
});

// 模型切換（只影響變數）
let currentModel = 'qwen2.5:3b';
app.post('/api/model/select', async (req, res) => {
  try {
    const { model } = req.body;
    if (!model) return res.status(400).json({ error: '缺少 model 參數' });

    currentModel = model;
    console.log(`✅ 模型已切換為 ${currentModel}`);
    res.json({ message: `模型已切換為：${model}` });
  } catch (err) {
    console.error('切換模型錯誤：', err);
    res.status(500).json({ error: '切換模型失敗' });
  }
});

// ✅ 開啟新對話（正確呼叫 agent.ts 的 resetChatManager）
app.post('/api/chat/new', async (_, res) => {
  try {
    resetChatManager();  // ✅ 正確清空內部 chat 記憶
    res.json({ message: '✅ 已清除上下文，下次輸入將重新初始化對話' });
  } catch (err) {
    console.error('重置對話失敗：', err);
    res.status(500).json({ error: '無法重新開始對話' });
  }
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`✅ API Server 運行於 http://localhost:${PORT}`);
});
