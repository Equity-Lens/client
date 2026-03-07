import React, { useState, useRef, useEffect } from "react";
import ChatSidebar from "../../components/features/ChatSidebar/index";
import { chatHistoryService } from "../../services/chatHistoryService";
import type { ChatSession } from "../../services/chatHistoryService";
import { useAuth } from "../../context/AuthContext";
import "../../styles/pages/_intelligence.scss";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: string[];
  toolsUsed?: string[];
}

const TradingIntelligence: React.FC = () => {
  const { isAuthenticated } = useAuth(); // Get auth state

  // Chat sessions state
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);

  // Messages state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const welcomeMessage: Message = {
    id: 1,
    role: "assistant",
    content:
      "Hello! I'm your Trading Intelligence assistant. I can help you analyze your portfolio, check stock prices, find market news, and provide personalized investment insights. What would you like to know?",
    timestamp: new Date(),
  };

  // Load sessions on mount - only for authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      loadSessions();
    } else {
      // Reset state for guests
      setSessions([]);
      setActiveSessionId(null);
      setMessages([welcomeMessage]);
      setIsLoadingSessions(false);
    }
  }, [isAuthenticated]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [inputValue]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoadingSessions(true);
      const data = await chatHistoryService.getSessions();
      setSessions(data);
    } catch (error) {
      console.error("Failed to load sessions:", error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleNewChat = async () => {
    try {
      const newSession = await chatHistoryService.createSession();
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    try {
      setActiveSessionId(sessionId);
      setIsLoading(true);

      const session = await chatHistoryService.getSession(sessionId);

      if (session.messages.length === 0) {
        setMessages([welcomeMessage]);
      } else {
        const loadedMessages: Message[] = session.messages.map((msg, index) => ({
          id: index + 1,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(loadedMessages);
      }
    } catch (error) {
      console.error("Failed to load session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await chatHistoryService.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));

      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Handle authenticated users with session persistence
    if (isAuthenticated) {
      let sessionId = activeSessionId;
      if (!sessionId) {
        try {
          const newSession = await chatHistoryService.createSession();
          setSessions((prev) => [newSession, ...prev]);
          setActiveSessionId(newSession.id);
          sessionId = newSession.id;
        } catch (error) {
          console.error("Failed to create session:", error);
          setIsLoading(false);
          return;
        }
      }

      try {
        const response = await chatHistoryService.sendMessage(sessionId, userMessage.content);

        const assistantMessage: Message = {
          id: Date.now() + 1,
          role: "assistant",
          content: response.answer || "I couldn't generate a response.",
          toolsUsed: response.tools_used || [],
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        loadSessions(); // Reload sessions to update title
      } catch (error) {
        console.error("Error sending message:", error);
        const errorMessage: Message = {
          id: Date.now() + 1,
          role: "assistant",
          content: "I encountered an error. Please make sure the AI service is running.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Handle guest users - no persistence
      try {
        const response = await chatHistoryService.sendMessageAsGuest(userMessage.content);

        const assistantMessage: Message = {
          id: Date.now() + 1,
          role: "assistant",
          content: response.answer || "I couldn't generate a response.",
          toolsUsed: response.tools_used || [],
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error("Error sending message:", error);
        const errorMessage: Message = {
          id: Date.now() + 1,
          role: "assistant",
          content: "I encountered an error. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatToolName = (tool: string): string => {
    const toolNames: Record<string, string> = {
      get_my_holdings: "📊 Portfolio Holdings",
      get_my_alerts: "🔔 Price Alerts",
      get_my_portfolio_summary: "📈 Portfolio Summary",
      get_stock_price: "💰 Stock Price",
      get_multiple_stock_prices: "💹 Multiple Prices",
      get_stock_history: "📉 Price History",
      get_earnings_calendar: "📅 Earnings Calendar",
      search_financial_news: "📰 Financial News",
      search_stock_news: "🔍 Stock News",
      search_market_sentiment: "🎯 Market Sentiment",
      get_financial_statements: "📊 Financial Statements",
      get_quarterly_earnings: "📊 Quarterly Earnings",
    };
    return toolNames[tool] || tool;
  };

  return (
    <div className="trading-intelligence">
      {/* Only show sidebar for authenticated users */}
      {isAuthenticated && (
        <ChatSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          onDeleteSession={handleDeleteSession}
          isLoading={isLoadingSessions}
        />
      )}

      <div className={`trading-intelligence__chat ${!isAuthenticated ? "trading-intelligence__chat--full-width" : ""}`}>
        <div className="chat-messages">
          {messages.map((message) => (
            <div key={message.id} className={`message message--${message.role}`}>
              <div className="message__content">
                <div className="message__text">{message.content}</div>

                {message.toolsUsed && message.toolsUsed.length > 0 && (
                  <div className="message__tools">
                    <span className="tools-label">Tools used:</span>
                    <div className="tools-list">
                      {message.toolsUsed.map((tool, index) => (
                        <span key={index} className="tool-badge">
                          {formatToolName(tool)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {message.sources && message.sources.length > 0 && (
                  <div className="message__sources">
                    <span className="sources-label">Sources:</span>
                    <ul>
                      {message.sources.map((source, index) => (
                        <li key={index}>{source.substring(0, 150)}...</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message message--assistant">
              <div className="message__content">
                <div className="message__typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input" onSubmit={handleSubmit}>
          <div className="chat-input__wrapper">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your portfolio, stock prices, or market news..."
              rows={1}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="chat-input__send"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M22 2L11 13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 2L15 22L11 13L2 9L22 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <div className="chat-input__hint">
            Press Enter to send, Shift+Enter for new line
          </div>
        </form>
      </div>
    </div>
  );
};

export default TradingIntelligence;