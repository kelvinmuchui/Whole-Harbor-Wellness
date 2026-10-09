import React, { useState } from 'react';

interface AskWHWDrawerProps {
  currentPath: string;
  navigate: (path: string, param?: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
}

export const AskWHWDrawer: React.FC<AskWHWDrawerProps> = ({ currentPath, navigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: "Hello! Welcome to Whole Harbor Wellness. I can answer questions about peptide reconstitution, storage, syringe scales, delivery guarantees, and order fulfillment. How can I help you today?"
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');

  // Pre-configured questions
  const quickQuestions = [
    {
      q: "How do I mix my peptides?",
      a: "Reconstitution Guide: 1) Swab stoppers with 70% alcohol. 2) Slowly inject sterile bacteriostatic water down the inside glass wall. 3) Gently swirl until fully dissolved—never shake. 4) Store refrigerated at 2–8°C immediately."
    },
    {
      q: "What syringe scale should I use?",
      a: "Standard subcutaneous protocols use U-100 insulin syringes (where 100 units = 1.0 mL). If using U-40 syringes, 40 units = 1.0 mL. Use our Mixing Calculator on the Learn page to verify exact draw markings."
    },
    {
      q: "How should vials be stored?",
      a: "Unmixed lyophilized powder vials can be kept cool or frozen for extended longevity. Once reconstituted with bacteriostatic water, vials MUST be refrigerated at 2–8°C (36–46°F) and never frozen."
    },
    {
      q: "What does the Delivery Guarantee cover?",
      a: "Our 100% Delivery Guarantee ensures that any parcel lost, damaged in transit, or detained will be replaced and reshipped at no additional product cost."
    },
    {
      q: "What is bacteriostatic water?",
      a: "Bacteriostatic Water contains 0.9% Benzyl Alcohol, which prevents bacterial growth and allows multi-dose access over several weeks. It is the gold standard diluent for peptide reconstitution."
    }
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');

    const lower = text.toLowerCase();
    const match = quickQuestions.find((item) =>
      lower.includes(item.q.toLowerCase().slice(0, 15)) ||
      item.q.toLowerCase().split(' ').some((w) => w.length > 4 && lower.includes(w))
    );

    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: match
          ? match.a
          : `For specific questions regarding "${text}", explore our verified guides on the Learn page or reach out directly to Kelvin via WhatsApp. Always confirm instructions with a licensed clinician.`
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 350);
  };

  // If already on the dedicated learn studio page, omit the floating button to prevent redundancy
  if (currentPath === 'learn') return null;

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-[#0c2340] hover:bg-[#c5a059] text-white rounded-full p-2.5 pr-4.5 flex items-center gap-2.5 shadow-xl border border-[#dfd7c7]/40 cursor-pointer transition-all hover:scale-105 active:scale-95 group"
        aria-label="Ask Whole Harbor"
      >
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-serif text-lg text-white group-hover:bg-white group-hover:text-[#c5a059] transition-colors">
          ✦
        </div>
        <span className="text-xs font-bold tracking-wide">Ask Whole Harbor</span>
      </button>

      {/* Slide-over Assistant Drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in"
          onClick={() => setIsOpen(false)}
        >
          <aside
            className="w-full max-w-[460px] h-full bg-[#fffdfb] border-l border-[#dfd7c7] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <header className="p-5 border-b border-[#dfd7c7] bg-[#f6f4ee] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-[#c5a059] bg-white text-[#c5a059] flex items-center justify-center font-serif text-xl shadow-2xs">
                  ✦
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold tracking-widest text-[#c5a059]">
                    EDUCATIONAL GUIDE
                  </p>
                  <h2 className="font-serif text-xl font-bold text-[#0c2340]">
                    Ask Whole Harbor
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-[#dfd7c7] text-[#0c2340] flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
                aria-label="Close"
              >
                ✕
              </button>
            </header>

            {/* Conversation Feed */}
            <div className="flex-1 p-5 overflow-y-auto space-y-3.5 bg-[#fffdfb]">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2.5 max-w-[88%] ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] shrink-0 ${
                      m.sender === 'user' ? 'bg-[#0c2340] text-white' : 'bg-[#c5a059] text-white font-serif'
                    }`}
                  >
                    {m.sender === 'user' ? 'You' : '✦'}
                  </div>
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-line shadow-2xs ${
                      m.sender === 'user'
                        ? 'bg-[#0c2340] text-white rounded-tr-none'
                        : 'bg-white text-[#0c2340] border border-[#dfd7c7] rounded-tl-none'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Suggestion Pills */}
            <div className="px-4 py-2 bg-[#f6f4ee] border-t border-[#dfd7c7] flex gap-2 overflow-x-auto no-scrollbar">
              {quickQuestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(item.q)}
                  className="px-2.5 py-1 rounded-full bg-white border border-[#dfd7c7] text-[10px] font-semibold text-[#0c2340] hover:bg-[#c5a059] hover:text-white transition-colors shrink-0 cursor-pointer shadow-2xs"
                >
                  {item.q}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputQuestion);
              }}
              className="p-3.5 bg-white border-t border-[#dfd7c7] flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                placeholder="Ask about mixing, storage, syringes, purity..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-[#f6f4ee] border border-[#dfd7c7] text-xs text-[#0c2340] placeholder-[#5a6b7c] focus:outline-none focus:ring-1 focus:ring-[#c5a059]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#c5a059] text-white text-xs font-bold hover:bg-[#0c2340] transition-colors cursor-pointer shrink-0"
              >
                Send
              </button>
            </form>

            {/* Link to Full Studio */}
            <div className="p-3.5 bg-[#f6f4ee] border-t border-[#dfd7c7] text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('learn');
                }}
                className="w-full py-2.5 rounded-xl bg-white border border-[#c5a059] text-[#c5a059] hover:bg-[#c5a059] hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <span>Open the full Education Studio &amp; calculator</span>
                <span>→</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
