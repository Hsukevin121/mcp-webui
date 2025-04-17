import express from 'express';
import cors from 'cors';
import { runAgent } from './agent';

const app = express(); 

// ===== Middleware =====
app.use(cors());
app.use(express.json());

// ===== 測試用路由 =====
app.get('/', (req, res) => {
  res.send('MCP Web API 運行中！');
});

//  修正後的 API（不強制指定型別）
app.post('/api/chat', async (req, res) => {
  const userMessage = (req.body as { message?: string }).message;

  if (!userMessage) {
    return res.status(400).json({ error: '缺少 message 參數' });
  }

  const reply = await runAgent(userMessage);
  res.json({ reply });
});

// ===== 啟動伺服器 =====
app.listen(3100, () => {
  console.log('✅ 後端 API 運行於 http://localhost:3100');
});
