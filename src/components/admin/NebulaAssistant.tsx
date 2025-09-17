'use client';

import React, { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import { Sparkles, LoaderCircle } from 'lucide-react';

type Message = {
  role: 'user' | 'nebula';
  content: string;
  timestamp: number;
};

export default function NebulaAssistant() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const sessionRef = useRef(uuidv4());
  const chatWindowRef = useRef<HTMLDivElement>(null);

  const handleAsk = async () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setInput('');

    try {
      const payload = {
        messages: [
          ...messages.map(({ role, content }) => ({ role, content })),
          { role: 'user', content: input },
        ],
        context: { sessionId: sessionRef.current },
      };
      const res = await fetch('/api/nebula', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && typeof data.message === 'string') {
        setMessages((prev) => [
          ...prev,
          { role: 'nebula', content: data.message, timestamp: Date.now() },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'nebula',
            content:
              'Error: ' +
              (typeof data.error === 'string'
                ? data.error
                : JSON.stringify(data.error) ||
                  'Error desconocido al comunicar con Nebula.'),
            timestamp: Date.now(),
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'nebula',
          content:
            'Error técnico: ' +
            (err && err.message
              ? err.message
              : typeof err === 'string'
              ? err
              : JSON.stringify(err)),
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        chatWindowRef.current?.scrollTo(0, chatWindowRef.current.scrollHeight);
      }, 80);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-white/10 border border-white/10 shadow-2xl rounded-3xl p-5 md:p-8 backdrop-blur-xl">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 text-purple-700 mb-6">
          <Sparkles className="w-7 h-7 animate-pulse" />
          Nebula Chat Admin
        </h1>

        {/* Chat Window */}
        <div
          ref={chatWindowRef}
          className="bg-white/5 rounded-xl p-4 mb-6 shadow-inner h-80 md:h-96 overflow-y-auto space-y-4"
        >
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-12 md:mt-32">
              ¡Inicia la conversación!
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm break-words shadow ${
                  msg.role === 'user'
                    ? 'bg-purple-600 text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-700 rounded-bl-md'
                }`}
              >
                <ReactMarkdown
                  components={{
                    img: (props) => (
                      <img
                        {...props}
                        className="rounded-md border shadow max-h-44 my-2"
                        alt={props.alt || ''}
                      />
                    ),
                    video: (props) => (
                      <video
                        {...props}
                        controls
                        className="rounded-lg border my-2 max-w-full"
                        style={{ maxHeight: '200px' }}
                      />
                    ),
                    a: (props) => (
                      <a
                        {...props}
                        className="underline text-purple-600 hover:text-purple-800"
                      />
                    ),
                    pre: (props) => (
                      <pre
                        {...props}
                        className="bg-black text-green-400 rounded p-3 overflow-x-auto my-2"
                      />
                    ),
                    code: ({ className, children, ...props }) => (
                      <code
                        {...props}
                        className={`bg-gray-200 rounded px-1 py-0.5 font-mono ${
                          className || ''
                        }`}
                      >
                        {children}
                      </code>
                    ),
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
                <div className="text-[0.7em] opacity-60 text-right mt-1">
                  {msg.role === 'user' ? 'Tú' : 'Nebula'} ·{' '}
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-purple-500 mt-4">
              <LoaderCircle className="animate-spin w-5 h-5" />
              Pensando...
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            disabled={loading}
            placeholder="Escribe tu pregunta para Nebula... (Shift+Enter para nueva línea)"
            className="w-full text-base p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition min-h-[60px] resize-none text-gray-900 pr-28"
          />
          <button
            onClick={handleAsk}
            disabled={loading || !input.trim()}
            className="absolute right-3 bottom-3 bg-purple-700 hover:bg-purple-800 text-white px-5 py-2 rounded-xl font-semibold shadow transition disabled:bg-gray-300 disabled:opacity-60"
          >
            {loading ? 'Consultando...' : 'Enviar'}
          </button>
        </div>
        <div className="text-xs text-gray-400 text-end mt-2">
          Soporta imágenes · videos · markdown · código
        </div>
      </div>
    </div>
  );
}
