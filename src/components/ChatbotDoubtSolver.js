import { useState, useRef, useEffect } from "react";

const API_KEY = "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"; // Replace with your actual key

export default function ChatbotDoubtSolver() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const askDoubt = async () => {
    if (!query.trim()) return;
    
    // Add user message to chat
    const userMessage = { role: "user", content: query };
    setMessages(prev => [...prev, userMessage]);
    setQuery("");
    setLoading(true);

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1-0528:free",
          messages: [
            {
              role: "system",
              content: "You are a helpful AI tutor. Answer student doubts step-by-step in simple language. Provide clear explanations and include 2-3 relevant study links when appropriate. Format your response with proper spacing and markdown-style headings (##) for sections.",
            },
            ...messages.filter(m => m.role !== "system").map(m => ({
              role: m.role,
              content: m.content
            })),
            {
              role: "user",
              content: query,
            },
          ],
        }),
      });

      const data = await res.json();
      console.log("DeepSeek Response:", data);

      if (data.choices && data.choices[0]?.message?.content) {
        const aiMessage = { 
          role: "assistant", 
          content: data.choices[0].message.content 
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorMessage = { 
          role: "assistant", 
          content: "❌ I couldn't process your request. Please try again later." 
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (err) {
      console.error("❌ DeepSeek error:", err);
      const errorMessage = { 
        role: "assistant", 
        content: "❌ An error occurred. Please check your connection and try again." 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askDoubt();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl z-50 transition-all duration-300 transform ${
          isOpen ? "rotate-180 bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-50 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-3 text-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg">Study Assistant</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-blue-100 mt-1">Ask me anything about your studies</p>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-3 overflow-y-auto bg-gray-50 max-h-80">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <p className="text-sm">Ask your study-related questions here</p>
                <p className="text-xs mt-1">I'll provide detailed explanations and resources</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`mb-3 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div 
                    className={`max-w-xs rounded-lg px-4 py-2 ${message.role === "user" 
                      ? "bg-blue-600 text-white rounded-br-none" 
                      : "bg-white border border-gray-200 rounded-bl-none"}`}
                  >
                    {message.role === "assistant" ? (
                      <div className="text-sm text-gray-800 whitespace-pre-wrap">
                        {message.content.split('\n').map((paragraph, i) => (
                          <p key={i} className="mb-2 last:mb-0">{paragraph}</p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
            {loading && (
              <div className="flex justify-start mb-3">
                <div className="bg-white border border-gray-200 rounded-lg rounded-bl-none px-4 py-2">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-3 bg-white">
            <div className="relative">
              <textarea
                rows={2}
                className="w-full border border-gray-300 rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Type your question here..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
              <button
                onClick={askDoubt}
                disabled={loading || !query.trim()}
                className={`absolute right-2 bottom-2 p-1 rounded-full ${loading || !query.trim() 
                  ? "text-gray-400" 
                  : "text-blue-600 hover:bg-blue-100"}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1 text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      )}
    </>
  );
}