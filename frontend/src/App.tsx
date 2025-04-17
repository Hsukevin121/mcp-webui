import React, { useState, useEffect } from 'react';
import {
  Container, Title, Select, Button, Textarea, Card, Text, Loader, Group,
  Stack, Notification, SegmentedControl
} from '@mantine/core';
import axios from 'axios';

const API_BASE = 'http://192.168.31.132:3100';

function App() {
  const [models, setModels] = useState([]);
  const [currentModel, setCurrentModel] = useState('');
  const [tone, setTone] = useState('formal');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`${API_BASE}/api/models`).then(res => {
      setModels(res.data.models);
      setCurrentModel(res.data.models[0]);
    });
  }, []);

  const sendMessage = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/chat`, { message, tone });
      setChatHistory(prev => [...prev, { user: message, assistant: res.data.reply }]);
      setMessage('');
    } catch (err) {
      setError('無法取得 AI 回覆');
    } finally {
      setLoading(false);
    }
  };

  const newChat = async () => {
    await axios.post(`${API_BASE}/api/chat/new`);
    setChatHistory([]);
  };

  return (
    <Container size="sm" py="lg">
      <Title mb="lg">🤖 MCP AI Chatbot</Title>

      {error && <Notification color="red" onClose={() => setError('')}>{error}</Notification>}

      <Group justify="space-between">
        <Select
          label="選擇模型"
          data={models}
          value={currentModel}
          onChange={setCurrentModel}
          style={{ width: '48%' }}
        />

        <SegmentedControl
          value={tone}
          onChange={setTone}
          data={[
            { label: '正式', value: 'formal' },
            { label: '簡潔', value: 'concise' },
            { label: '幽默', value: 'humorous' },
          ]}
          style={{ width: '48%' }}
        />
      </Group>

      <Stack my="md">
        {chatHistory.map((msg, i) => (
          <Card key={i} shadow="sm">
            <Text size="sm" color="dimmed"><b>你：</b> {msg.user}</Text>
            <Text size="sm"><b>AI：</b> {msg.assistant}</Text>
          </Card>
        ))}
      </Stack>

      <Textarea
        placeholder="輸入訊息..."
        value={message}
        onChange={(e) => setMessage(e.currentTarget.value)}
        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
      />

      <Group mt="md">
        <Button fullWidth onClick={sendMessage} disabled={loading}>
          {loading ? <Loader size="xs" color="white" /> : '送出'}
        </Button>
        <Button variant="outline" fullWidth onClick={newChat}>
          新對話
        </Button>
      </Group>
    </Container>
  );
}

export default App;
