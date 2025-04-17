import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setReply(''); // 清除上次回答
    try {
      const res = await axios.post('http://192.168.31.132:3100/api/chat', {
        message,
      });

      setReply(res.data.reply); // ✅ 顯示來自後端的 AI 回覆
    } catch (err) {
      setReply('❌ 無法取得回覆，請確認後端是否正在運作');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: 'Arial', maxWidth: 800, margin: '0 auto' }}>
      <h2>🤖 MCP AI 聊天室</h2>

      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          value={message}
          placeholder="輸入你的問題..."
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') sendMessage();
          }}
          style={{
            width: '80%',
            padding: '8px',
            fontSize: '16px',
          }}
        />
        <button onClick={sendMessage} style={{ marginLeft: 8, padding: '8px 16px' }}>
          傳送
        </button>
      </div>

      {loading && <p>⌛ 回覆中，請稍候...</p>}

      {reply && !loading && (
        <div style={{ marginTop: 16, backgroundColor: '#f0f0f0', padding: 16, borderRadius: 8 }}>
          <strong>AI 回覆：</strong>
          <p style={{ whiteSpace: 'pre-wrap' }}>{reply}</p>
        </div>
      )}
    </div>
  );
}

export default App;
