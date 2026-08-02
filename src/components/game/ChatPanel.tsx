import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { type GameState } from '@/lib/gameLogic';

interface ChatPanelProps {
  chat: GameState['chat'];
  onSend: (text: string) => void;
}

export function ChatPanel({ chat, onSend }: ChatPanelProps) {
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSend(text.trim());
      setText('');
    }
  };

  return (
    <div className="w-full bg-[var(--color-wood-dark)] border border-[#3b2419] rounded-xl flex flex-col h-48 overflow-hidden shadow-inner">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 flex flex-col gap-2"
      >
        {chat.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-[var(--color-ivory)]/30 text-sm italic">
            Aucun message
          </div>
        ) : (
          chat.map((msg, i) => (
            <div key={i} className="text-sm">
              <span className="font-bold text-[var(--color-brass)] mr-2">{msg.sender}:</span>
              <span className="text-[var(--color-ivory)]/90 break-words">{msg.text}</span>
            </div>
          ))
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="border-t border-[#3b2419] p-2 flex gap-2 bg-[#180f0a]/50">
        <input 
          type="text" 
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message..."
          className="flex-1 bg-transparent border-none outline-none text-[var(--color-ivory)] text-sm px-2 placeholder-[var(--color-ivory)]/30"
        />
        <button 
          type="submit"
          disabled={!text.trim()}
          className="p-1.5 bg-[var(--color-wood-medium)] text-[var(--color-brass)] rounded-md hover:bg-[#4a2e1b] disabled:opacity-50 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
