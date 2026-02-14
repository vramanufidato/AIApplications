import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const API_BASE_URL = 'http://localhost:3001';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatWindowRef = useRef(null);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim()) {
      const userMessage = { type: 'user', text: input };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setInput('');
      setLoading(true);

      try {
        let botResponse = '';
        let source = '';

        // First, try RAG search
        const ragResponse = await fetch(`${API_BASE_URL}/rag_search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: input }),
        });
        const ragData = await ragResponse.json();

        if (ragData.answer && ragData.answer !== 'No relevant information found in local books.') {
          botResponse = ragData.answer;
          source = `(Source: ${ragData.source})`;
        } else {
          // If RAG fails, check for specific keywords for web search
          if (input.toLowerCase().includes('latest news') || input.toLowerCase().includes('future technology') || input.toLowerCase().includes('real-time events')) {
            const googleResponse = await fetch(`${API_BASE_URL}/google_search`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ query: input }),
            });
            const googleData = await googleResponse.json();
            botResponse = `${googleData.answer.snippet} Read more: ${googleData.answer.url}`;
            source = `(Source: ${googleData.source})`;
          } else {
            // If RAG fails and no specific web keywords, try to download books
            setMessages((prev) => [...prev, { type: 'bot', text: "No relevant local books found. Attempting to find and download new books on the topic..." }]);
            const downloadResponse = await fetch(`${API_BASE_URL}/download_books`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ topic: input }), // Use the input as topic for now
            });
            const downloadData = await downloadResponse.json();

            if (downloadData.downloaded_files && downloadData.downloaded_files.length > 0) {
              setMessages((prev) => [...prev, { type: 'bot', text: `Successfully downloaded ${downloadData.downloaded_files.length} new books. Re-indexing knowledge base...` }]);
              // After downloading and re-indexing, try RAG search again
              const newRagResponse = await fetch(`${API_BASE_URL}/rag_search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: input }),
              });
              const newRagData = await newRagResponse.json();
              if (newRagData.answer && newRagData.answer !== 'No relevant information found in local books.') {
                botResponse = newRagData.answer;
                source = `(Source: ${newRagData.source})`;
              } else {
                botResponse = `I downloaded some books, but still couldn't find a direct answer to "${input}". ${downloadData.result}`;
                source = '(Source: Downloaded Books)';
              }
            } else {
              botResponse = `I could not find any books on "${input}" to download. Please try a different query or topic.`;
              source = '(Source: Failed Book Download)';
            }
          }
        }
        
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: 'bot', text: `${botResponse} ${source}` },
        ]);

      } catch (error) {
        console.error('Error sending message to backend:', error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: 'bot', text: 'Oops! Something went wrong. Please try again.' },
        ]);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Research Librarian AI</h1>
      </header>
      <div className="chat-window" ref={chatWindowRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            {msg.text}
          </div>
        ))}
        {loading && <div className="message bot">Thinking...</div>}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !loading && handleSendMessage()}
          placeholder={loading ? 'Please wait...' : 'Ask me anything...'}
          disabled={loading}
        />
        <button onClick={handleSendMessage} disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

export default App;

