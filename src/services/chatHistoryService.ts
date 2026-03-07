const API_BASE_URL = import.meta.env.VITE_AI_SERVICE_URL || "http://localhost:8000/v1/ai/sessions";
// const API_BASE_URL = import.meta.env.VITE_AI_SERVICE_URL || "http://localhost:8000/v1/ai/sessions";

// Get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem("token") || localStorage.getItem("accessToken");
};

// Build headers
const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

// Types
export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatSessionWithMessages extends ChatSession {
  messages: ChatMessage[];
}

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  answer: string;
  tools_used: string[];
}

// API Functions
export const chatHistoryService = {
  // Get all sessions
  async getSessions(): Promise<ChatSession[]> {
    const response = await fetch(API_BASE_URL, {
      headers: getHeaders(),
    });
    const data = await response.json();
    return data.data?.sessions || [];
  },

  // Create new session
  async createSession(title?: string): Promise<ChatSession> {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ title: title || "New Chat" }),
    });
    const data = await response.json();
    return data.data;
  },

  // Get session with messages
  async getSession(sessionId: string): Promise<ChatSessionWithMessages> {
    const response = await fetch(`${API_BASE_URL}/${sessionId}`, {
      headers: getHeaders(),
    });
    const data = await response.json();
    return data.data;
  },

  // Chat in session
  async sendMessage(sessionId: string, query: string): Promise<{
    answer: string;
    tools_used: string[];
  }> {
    const response = await fetch(`${API_BASE_URL}/${sessionId}/chat`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ query }),
    });
    const data = await response.json();
    return data.data;
  },

  // Delete session
  async deleteSession(sessionId: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/${sessionId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return response.ok;
  },

  // Update session title
  async updateTitle(sessionId: string, title: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/${sessionId}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ title }),
    });
    return response.ok;
  },

  // Guest chat - stateless, no persistence
  async sendMessageAsGuest(
    message: string,
    conversationHistory: ConversationMessage[] = []
  ): Promise<ChatResponse> {
    const response = await fetch(`${API_BASE_URL}/chat/guest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        conversation_history: conversationHistory,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send message");
    }

    const result = await response.json();

    return {
      answer: result.data?.answer || "I couldn't generate a response.",
      tools_used: result.data?.tools_used || [],
    };
  },
};