import { useState, useEffect, useRef } from 'react';
import { Bot, X } from 'lucide-react';
import API from '../../api/axios';

const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!open || messages.length > 0) return;
    API.get('/chat/history')
      .then((res) => {
        if (res.data.length > 0) setMessages(res.data);
        else {
          setMessages([
            { role: 'assistant', content: 'Hi! I am your society assistant. How can I help you today?' },
          ]);
        }
      })
      .catch(() =>
        setMessages([
          { role: 'assistant', content: 'Hi! I am your society assistant. How can I help you today?' },
        ])
      );
  }, [open, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);
    try {
      const res = await API.post('/chat', { message: text });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: err.response?.data?.message || 'Sorry, I could not connect. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    await API.delete('/chat/history');
    setMessages([{ role: 'assistant', content: 'Chat cleared. How can I help?' }]);
  };

  return (
    <div className="chatbot-container">
      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <span>Society Assistant</span>
            <button type="button" onClick={handleClear}>
              Clear
            </button>
          </div>
          <div className="chatbot-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role}`}>
                <p>{m.content}</p>
              </div>
            ))}
            {loading && (
              <div className="chat-msg assistant">
                <p>Thinking...</p>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div className="chatbot-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
            />
            <button type="button" onClick={handleSend} disabled={loading}>
              Send
            </button>
          </div>
        </div>
      )}
      <button type="button" className="chatbot-fab" onClick={() => setOpen((o) => !o)} aria-label="Toggle society assistant">
        {open ? <X className="nav-icon" aria-hidden="true" /> : <Bot className="nav-icon" aria-hidden="true" />}
      </button>
    </div>
  );
};

export default ChatbotWidget;
