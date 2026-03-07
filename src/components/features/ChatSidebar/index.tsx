import React, { useState } from "react";
import type { ChatSession } from "../../../services/chatHistoryService";
import "../../../styles/components/_chat-sidebar.scss"

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
  isLoading: boolean;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  isLoading,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const groupSessionsByDate = (sessions: ChatSession[]) => {
    const groups: { [key: string]: ChatSession[] } = {
      Today: [],
      Yesterday: [],
      "Previous 7 Days": [],
      Older: [],
    };

    sessions.forEach((session) => {
      const date = new Date(session.updated_at);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) groups["Today"].push(session);
      else if (diffDays === 1) groups["Yesterday"].push(session);
      else if (diffDays < 7) groups["Previous 7 Days"].push(session);
      else groups["Older"].push(session);
    });

    return groups;
  };

  const groupedSessions = groupSessionsByDate(sessions);

  return (
    <div className="chat-sidebar">
      <div className="chat-sidebar__header">
        <h2>Chats</h2>
        <button className="chat-sidebar__new-btn" onClick={onNewChat}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Chat
        </button>
      </div>

      <div className="chat-sidebar__list">
        {isLoading ? (
          <div className="chat-sidebar__loading">
            <span></span>
            <span></span>
            <span></span>
          </div>
        ) : sessions.length === 0 ? (
          <div className="chat-sidebar__empty">
            <p>No conversations yet</p>
            <span>Start a new chat to begin</span>
          </div>
        ) : (
          Object.entries(groupedSessions).map(
            ([group, groupSessions]) =>
              groupSessions.length > 0 && (
                <div key={group} className="chat-sidebar__group">
                  <div className="chat-sidebar__group-title">{group}</div>
                  {groupSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`chat-sidebar__item ${
                        activeSessionId === session.id ? "chat-sidebar__item--active" : ""
                      }`}
                      onClick={() => onSelectSession(session.id)}
                      onMouseEnter={() => setHoveredId(session.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      <div className="chat-sidebar__item-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                      </div>
                      <div className="chat-sidebar__item-content">
                        <span className="chat-sidebar__item-title">{session.title}</span>
                      </div>
                      {hoveredId === session.id && (
                        <button
                          className="chat-sidebar__item-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(session.id);
                          }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )
          )
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;