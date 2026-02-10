import { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import { CitationBadge } from './CitationBadge';

interface Source {
  id: number;
  index: number;
  page: number | null;
  content: string;
  similarity: number;
}

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
}

export const ChatMessage = memo(function ChatMessage({ role, content, sources = [] }: ChatMessageProps) {
  const isUser = role === 'user';

  // Parse citations like [1], [2] from the content and make them interactive
  const processedContent = useMemo(() => {
    if (!sources.length) return content;
    
    // Replace [n] with placeholders we'll handle in markdown
    return content;
  }, [content, sources]);

  const renderContent = () => {
    if (isUser) {
      return <p className="text-chat-user-foreground">{content}</p>;
    }

    return (
      <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-chat-assistant-foreground prose-strong:text-foreground prose-ul:text-chat-assistant-foreground prose-li:text-chat-assistant-foreground">
        <ReactMarkdown
          components={{
            p: ({ children }) => {
              // Process children to replace citation patterns with badges
              const processChildren = (child: React.ReactNode): React.ReactNode => {
                if (typeof child === 'string') {
                  const parts = child.split(/(\[\d+\])/g);
                  return parts.map((part, idx) => {
                    const match = part.match(/\[(\d+)\]/);
                    if (match) {
                      const num = parseInt(match[1], 10);
                      const source = sources.find(s => s.index === num);
                      if (source) {
                        return <CitationBadge key={idx} citationNumber={num} source={source} />;
                      }
                    }
                    return part;
                  });
                }
                return child;
              };

              const processed = Array.isArray(children) 
                ? children.map(processChildren)
                : processChildren(children);

              return <p className="mb-3 last:mb-0">{processed}</p>;
            },
            ul: ({ children }) => (
              <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>
            ),
            li: ({ children }) => {
              const processChildren = (child: React.ReactNode): React.ReactNode => {
                if (typeof child === 'string') {
                  const parts = child.split(/(\[\d+\])/g);
                  return parts.map((part, idx) => {
                    const match = part.match(/\[(\d+)\]/);
                    if (match) {
                      const num = parseInt(match[1], 10);
                      const source = sources.find(s => s.index === num);
                      if (source) {
                        return <CitationBadge key={idx} citationNumber={num} source={source} />;
                      }
                    }
                    return part;
                  });
                }
                return child;
              };
              
              const processed = Array.isArray(children)
                ? children.map(processChildren)
                : processChildren(children);
                
              return <li>{processed}</li>;
            },
            strong: ({ children }) => (
              <strong className="font-semibold text-primary">{children}</strong>
            ),
          }}
        >
          {processedContent}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser 
            ? 'gradient-primary text-white' 
            : 'bg-secondary text-primary'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message bubble */}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-chat-user text-chat-user-foreground rounded-tr-md'
            : 'bg-chat-assistant text-chat-assistant-foreground rounded-tl-md shadow-soft'
        }`}
      >
        {renderContent()}
      </div>
    </motion.div>
  );
});