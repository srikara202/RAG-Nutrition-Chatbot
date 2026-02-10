import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { ChatInput } from '@/components/ChatInput';
import { ChatMessage } from '@/components/ChatMessage';
import { LoadingDots } from '@/components/LoadingDots';
import { Disclaimer } from '@/components/Disclaimer';
import { WelcomeMessage } from '@/components/WelcomeMessage';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface Source {
  id: number;
  index: number;
  page: number | null;
  content: string;
  similarity: number;
  doc_id: string;
  chunk_index: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingSoundIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { playTypingSound, playResponseSound } = useSoundEffects();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Play typing sound while loading
  useEffect(() => {
    if (isLoading) {
      playTypingSound();
      typingSoundIntervalRef.current = setInterval(() => {
        playTypingSound();
      }, 600);
    } else {
      if (typingSoundIntervalRef.current) {
        clearInterval(typingSoundIntervalRef.current);
        typingSoundIntervalRef.current = null;
      }
    }

    return () => {
      if (typingSoundIntervalRef.current) {
        clearInterval(typingSoundIntervalRef.current);
      }
    };
  }, [isLoading, playTypingSound]);

  const handleSendMessage = async (message: string) => {
    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('rag-chat', {
        body: { message },
      });

      if (error) throw error;

      // Play response sound
      playResponseSound();

      // Add assistant message with sources
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer || "I couldn't find an answer to that question.",
          sources: data.sources || [],
        },
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm sorry, I encountered an error while processing your question. Please try again.",
          sources: [],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen gradient-hero">
      <Header />

      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <WelcomeMessage onSuggestionClick={handleSendMessage} />
          ) : (
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {messages.map((message, index) => (
                  <ChatMessage
                    key={index}
                    role={message.role}
                    content={message.content}
                    sources={message.sources}
                  />
                ))}
              </AnimatePresence>

              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-primary flex items-center justify-center">
                    🤖
                  </div>
                  <div className="bg-chat-assistant text-chat-assistant-foreground rounded-2xl rounded-tl-md px-4 py-3 shadow-soft">
                    <LoadingDots />
                  </div>
                </motion.div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <ChatInput onSend={handleSendMessage} disabled={isLoading} />
        </div>
        <Disclaimer />
      </div>
    </div>
  );
};

export default Index;