'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { getDateLocale } from '@/lib/utils';
import { Message, User } from '@/lib/types';

interface ExchangeChatProps {
  exchangeId: string;
  exchangeStatus: string;
  messages: Message[];
  currentUser: User | null;
  onSendMessage: (content: string) => Promise<void>;
  onEditMessage: (msgId: string, content: string) => Promise<void>;
  onDeleteMessage: (msgId: string) => Promise<void>;
}

export default function ExchangeChat({
  exchangeStatus,
  messages,
  currentUser,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
}: ExchangeChatProps) {
  const { t, locale } = useTranslation();
  const dateLocale = getDateLocale(locale);

  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);

  // Auto-scroll only within the chat container, and only if user is near the bottom
  useEffect(() => {
    if (!shouldAutoScroll.current) return;
    const container = chatContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setSendingMessage(true);
    shouldAutoScroll.current = true;
    try {
      await onSendMessage(newMessage.trim());
      setNewMessage('');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleEdit = async (msgId: string) => {
    if (!editContent.trim()) return;
    try {
      await onEditMessage(msgId, editContent.trim());
      setEditingId(null);
      setEditContent('');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          {t('exDetail_chatTitle')}
        </h2>
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        onScroll={() => {
          const el = chatContainerRef.current;
          if (el) {
            const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
            shouldAutoScroll.current = nearBottom;
          }
        }}
        className="p-6 max-h-[400px] overflow-y-auto space-y-4"
        style={{ minHeight: '200px' }}
      >
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">{t('exDetail_chatEmpty')}</p>
            <p className="text-gray-300 text-xs mt-1">{t('exDetail_chatStart')}</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === currentUser?.id;
            const isEdited = msg.updatedAt && msg.updatedAt !== msg.createdAt;

            return (
              <div key={msg.id} className={`flex gap-3 group ${isMine ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    isMine ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {msg.sender?.name?.[0] || '?'}
                </div>

                {/* Message bubble */}
                <div className={`max-w-[70%] ${isMine ? 'text-right' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-medium ${isMine ? 'text-teal-600' : 'text-gray-700'}`}
                    >
                      {isMine ? t('you') : msg.sender?.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(msg.createdAt).toLocaleTimeString(dateLocale, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {isEdited && (
                      <span className="text-xs text-gray-400 italic">
                        {t('exDetail_chatEdited')}
                      </span>
                    )}
                  </div>

                  {editingId === msg.id ? (
                    // Edit mode
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleEdit(msg.id);
                          if (e.key === 'Escape') {
                            setEditingId(null);
                            setEditContent('');
                          }
                        }}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-teal-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none text-sm"
                        autoFocus
                      />
                      <button
                        onClick={() => handleEdit(msg.id)}
                        className="px-3 py-1.5 text-xs bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditContent('');
                        }}
                        className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="relative inline-block text-left">
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isMine
                            ? 'bg-teal-600 text-white rounded-tr-md'
                            : 'bg-gray-100 text-gray-800 rounded-tl-md'
                        }`}
                      >
                        {msg.content}
                      </div>

                      {/* Edit/Delete buttons (own messages only) */}
                      {isMine && exchangeStatus !== 'COMPLETED' && (
                        <div
                          className={`absolute top-0 ${isMine ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity px-1`}
                        >
                          <button
                            onClick={() => {
                              setEditingId(msg.id);
                              setEditContent(msg.content);
                            }}
                            className="p-1.5 rounded-lg bg-white shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors text-xs"
                            title={t('exDetail_chatEditTitle')}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => onDeleteMessage(msg.id)}
                            className="p-1.5 rounded-lg bg-white shadow-sm border border-gray-100 hover:bg-red-50 transition-colors text-xs"
                            title={t('exDetail_chatDeleteTitle')}
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat input */}
      {exchangeStatus !== 'COMPLETED' && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30">
          <div className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={t('exDetail_chatPlaceholder')}
              disabled={sendingMessage}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={sendingMessage || !newMessage.trim()}
              className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-700 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {sendingMessage ? (
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <span>{t('exDetail_chatSend')}</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
