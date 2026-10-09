import React, { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext.tsx';

interface LearnViewProps {
  initialTab?: string;
  navigate: (path: string, param?: string) => void;
}

interface GuideSection {
  title: string;
  paragraphs?: string[];
  items?: string[];
}

interface GuideTopic {
  id: string;
  icon: string;
  title: string;
  summary: string;
  sections: GuideSection[];
}

interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  timestamp: string;
}

export const LearnView: React.FC<LearnViewProps> = ({ initialTab, navigate }) => {
  const { setIsOpen: setCartOpen, totalVialsOrKits } = useCart();

  // Navigation tabs: 'ask' or 'calculator'
  const [activeTab, setActiveTab] = useState<'ask' | 'calculator'>(
    initialTab === 'calculator' ? 'calculator' : 'ask'
  );

  // Selected guide for in-depth reader modal
  const [activeGuide, setActiveGuide] = useState<GuideTopic | null>(null);

  // Calculator inputs
  const [vialAmount, setVialAmount] = useState<number>(5); // mg
  const [mixingVolume, setMixingVolume] = useState<number>(2); // mL
  const [syringeScale, setSyringeScale] = useState<'U-100' | 'U-40' | 'Tuberculin'>('U-100');
  const [purity, setPurity] = useState<number>(100); // %
  const [doseAmount, setDoseAmount] = useState<number>(250); // numeric
  const [doseUnit, setDoseUnit] = useState<'mcg' | 'mg'>('mcg');

  // Interactive Education Assistant Chat
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: "Hello! Welcome to the Education Studio. I am here to provide clear, verified guidance on peptide reconstitution, proper storage, syringe measurements, and ordering procedures. How can I help you today?",
      timestamp: 'Just now'
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');

  // Knowledge base answers for search & suggested questions
  const qaKnowledge: { query: string; answer: string }[] = [
    {
      query: "How do I mix my peptides?",
      answer: "Reconstitution Guide:\n1. Prepare a clean, sanitized surface and gather fresh 70% alcohol prep pads, a sterile syringe, bacteriostatic water, and your peptide vial.\n2. Swab the rubber stoppers of both vials with alcohol and allow to air dry completely.\n3. Slowly inject the recommended amount of bacteriostatic water down the inside glass wall of the peptide vial—do not spray directly onto the powder cake.\n4. Gently swirl the vial in circular motions until fully dissolved. Never shake vigorously, as peptide chains are delicate and can denature.\n5. Store in the refrigerator at 2–8°C (36–46°F) immediately after mixing."
    },
    {
      query: "What syringe scale should I use?",
      answer: "Most subcutaneous peptide protocols use standard U-100 insulin syringes (where 100 units = 1.0 mL, meaning 10 units = 0.1 mL). If using a U-40 syringe, 40 units = 1.0 mL. For veterinary or specialized protocols, Tuberculin syringes measure directly in hundredths of a milliliter (0.01 mL). Always confirm your syringe markings with our Mixing Calculator before drawing."
    },
    {
      query: "How should vials be stored after mixing?",
      answer: "Once reconstituted with bacteriostatic water, peptides must be stored refrigerated between 2°C and 8°C (36°F to 46°F) and protected from direct sunlight. Do not freeze reconstituted peptides. Unmixed (lyophilized) powder vials can be kept refrigerated for up to 12–24 months or frozen at -20°C for extended multi-year preservation."
    },
    {
      query: "What does the Delivery Guarantee cover?",
      answer: "Every order is backed by our 100% Delivery Guarantee. If a shipment is verified as lost, damaged in transit, or intercepted through no fault of your own, we will replace and reship the entire order at no additional product cost. All shipments are packed in temperature-buffered insulated mailers."
    },
    {
      query: "What is the difference between U-100 and U-40 syringes?",
      answer: "The 'U' rating designates how many units equal exactly 1 milliliter (1 mL) of liquid. On a U-100 syringe, 100 units = 1 mL (so 1 unit = 0.01 mL). On a U-40 syringe, 40 units = 1 mL (so 1 unit = 0.025 mL). Because units differ by 2.5×, using the correct scale setting in our calculator is critical to ensure accurate dosing."
    },
    {
      query: "How do I read a Certificate of Analysis (COA)?",
      answer: "A certified COA (Certificate of Analysis) confirms three critical parameters: 1) Identification by High-Performance Liquid Chromatography (HPLC) and Mass Spectrometry (MS); 2) Purity percentage (our standard is >99.0% pure); and 3) Mass verification of the lyophilized powder cake in milligrams. Every batch lot number on your vial matches an authenticated lab report."
    },
    {
      query: "What kind of water should I use for reconstitution?",
      answer: "Always use sterile Bacteriostatic Water containing 0.9% Benzyl Alcohol (USP grade). The benzyl alcohol acts as a gentle antimicrobial preservative, preventing bacterial contamination and allowing multi-dose use from the reconstituted vial over several weeks. Never use plain tap water or unpreserved sterile water for multi-dose vials."
    }
  ];

  // Mathematical Calculation Engine
  const calcResults = useMemo(() => {
    const safePurity = Math.min(100, Math.max(0, purity || 100));
    const effectiveMg = vialAmount * (safePurity / 100);
    const concentration = mixingVolume > 0 ? effectiveMg / mixingVolume : 0; // mg/mL
    const targetMg = doseUnit === 'mcg' ? doseAmount / 1000 : doseAmount;
    const liquidToDrawMl = concentration > 0 ? targetMg / concentration : 0;
    const scaleMultiplier = syringeScale === 'U-40' ? 40 : 100;
    const drawUnits = liquidToDrawMl * scaleMultiplier;
    const amountPerUnitMg = scaleMultiplier > 0 ? concentration / scaleMultiplier : 0;
    const amountPerUnitMcg = amountPerUnitMg * 1000;
    const totalUnitsInVial = mixingVolume * scaleMultiplier;
    const dosesPerVial = targetMg > 0 ? Math.floor(effectiveMg / targetMg) : 0;

    return {
      effectiveMg,
      concentration,
      liquidToDrawMl,
      drawUnits,
      amountPerUnitMcg,
      totalUnitsInVial,
      dosesPerVial
    };
  }, [vialAmount, mixingVolume, syringeScale, purity, doseAmount, doseUnit]);

  // Preset Applicator
  const applyPreset = (presetName: string) => {
    switch (presetName) {
      case 'semaglutide':
        setVialAmount(5);
        setMixingVolume(2);
        setDoseAmount(250);
        setDoseUnit('mcg');
        setSyringeScale('U-100');
        setPurity(100);
        break;
      case 'tirzepatide':
        setVialAmount(10);
        setMixingVolume(2);
        setDoseAmount(2.5);
        setDoseUnit('mg');
        setSyringeScale('U-100');
        setPurity(100);
        break;
      case 'bpc157':
        setVialAmount(5);
        setMixingVolume(2);
        setDoseAmount(250);
        setDoseUnit('mcg');
        setSyringeScale('U-100');
        setPurity(100);
        break;
      case 'nad':
        setVialAmount(500);
        setMixingVolume(5);
        setDoseAmount(50);
        setDoseUnit('mg');
        setSyringeScale('U-100');
        setPurity(100);
        break;
      case 'retatrutide':
        setVialAmount(10);
        setMixingVolume(2);
        setDoseAmount(2);
        setDoseUnit('mg');
        setSyringeScale('U-100');
        setPurity(100);
        break;
      default:
        break;
    }
  };

  // Chat Submission
  const handleAskQuestion = (questionText: string) => {
    if (!questionText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: questionText,
      timestamp: 'Just now'
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');

    // Find closest knowledge answer
    const qLower = questionText.toLowerCase();
    const matched = qaKnowledge.find(
      (k) =>
        qLower.includes(k.query.toLowerCase()) ||
        k.query.toLowerCase().split(' ').some((word) => word.length > 3 && qLower.includes(word))
    );

    setTimeout(() => {
      const responseText = matched
        ? matched.answer
        : `Thank you for asking: "${questionText}". For your specific protocol and individual medical circumstances, please refer to our verified Reconstitution Guide or contact our clinical concierge. Always verify dose recommendations and vial strength with a licensed clinician.`;

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: responseText,
        timestamp: 'Just now'
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 450);
  };

  // Educational Guides Catalog
  const guideTopics: GuideTopic[] = [
    {
      id: 'welcome',
      icon: '♡',
      title: 'Welcome from Kelvin',
      summary: 'Meet Kelvin and discover the foundational care story behind Whole Harbor Wellness.',
      sections: [
        {
          title: 'My story',
          paragraphs: [
            'Whole Harbor Wellness began with my own wellness journey. Like many people, I was committed to living a healthy lifestyle—eating well, exercising and taking care of myself—but I still did not feel like the best version of myself.',
            'That experience led me to spend countless hours learning about cellular optimization, bio-identical hormone support, and peptides. As I learned more, I realized these tools had the potential to support people with many different wellness goals and at different stages of life.'
          ]
        },
        {
          title: 'Why Whole Harbor Wellness?',
          paragraphs: [
            'Living between Canada and Mexico gave me the opportunity to learn from different healthcare experiences and connect with people from many backgrounds. One thing became clear: many people struggled to find reliable information, quality products and someone they could trust to answer their questions.',
            'I created Whole Harbor Wellness to make the experience simple, private, professional and supportive from beginning to end.'
          ]
        },
        {
          title: 'What makes us different',
          items: [
            'Personal support directly from Kelvin and our dedicated clinical team',
            'Carefully selected cGMP certified manufacturing laboratories',
            'Worldwide cold-chain secure shipping with insulated packaging',
            'A private, confidential, and secure ordering process',
            'Ongoing educational support before and after your order arrives'
          ]
        }
      ]
    },
    {
      id: 'ordering',
      icon: '♧',
      title: 'How Ordering Works',
      summary: 'A clear walkthrough from browsing and cart selection to personal confirmation.',
      sections: [
        {
          title: 'Shop and submit',
          items: [
            'Browse the catalog and review the detailed product and Certificate of Analysis (COA) information.',
            'Choose your strength, lot specification, and volume options.',
            'Complete your delivery address and contact details at checkout.',
            'Submit your order. Payment is processed privately and securely with personal concierge tracking.'
          ]
        },
        {
          title: 'Order review & verification',
          paragraphs: [
            'Every submitted order is manually reviewed to verify stock allocation, cold-chain scheduling, and customer instructions.',
            'You will receive private notification once your parcel is prepped for temperature-controlled dispatch.'
          ]
        }
      ]
    },
    {
      id: 'shipping',
      icon: '▱',
      title: 'Shipping & Delivery',
      summary: 'Processing times, tracking, address care and our 100% Delivery Guarantee.',
      sections: [
        {
          title: 'Delivery guarantee',
          paragraphs: [
            'Every order is backed by our Delivery Guarantee. If a package is verified as lost in transit or cannot be delivered through no fault of your own, we will work with you and reship the order at no additional product cost.'
          ],
          items: [
            'Free replacement for verified lost shipments',
            'Responsive human concierge support throughout the shipping process',
            'The guarantee applies to the shipping address verified at checkout'
          ]
        },
        {
          title: 'Thermal insulated packaging',
          paragraphs: [
            'All temperature-sensitive lyophilized compounds are packed with medical-grade insulation and cold packs to preserve biochemical integrity throughout transit.'
          ]
        }
      ]
    },
    {
      id: 'mixing',
      icon: '◇',
      title: 'Mixing Your Peptides',
      summary: 'A calm, safety-first reconstitution checklist from the client care guide.',
      sections: [
        {
          title: 'Supplies to have ready',
          items: [
            'The peptide vial and verified product instructions',
            'The correct sealed diluent (Bacteriostatic Water with 0.9% Benzyl Alcohol)',
            'Fresh 70% isopropyl alcohol prep pads',
            'New sterile mixing syringes and ultra-fine subcutaneous needles',
            'A clean, sanitized work surface',
            'Vial labels, a permanent marker, and an approved sharps disposal container'
          ]
        },
        {
          title: 'Reconstitution step-by-step',
          items: [
            'Wash hands thoroughly with soap and warm water for 30 seconds.',
            'Pop the protective plastic caps from both vials and swab the rubber stoppers with alcohol.',
            'Draw the required amount of bacteriostatic water (e.g. 2.0 mL) into your mixing syringe.',
            'Insert needle into the peptide vial at an angle; slowly run the diluent down the inside glass wall.',
            'Gently swirl the vial until the powder completely dissolves into a clear liquid. Do NOT shake.',
            'Inspect the liquid: it should be crystal clear without cloudiness or floating particulate matter.'
          ]
        }
      ]
    },
    {
      id: 'storage',
      icon: '❧',
      title: 'Storage & Care',
      summary: 'How to inspect, label and store products before and after reconstitution.',
      sections: [
        {
          title: 'When your order arrives',
          items: [
            'Open the package promptly and inspect the sealed vial integrity.',
            'Match each product label, lot number, strength, and expiration date.',
            'Inspect for any cracks, leaks, or loose seals.',
            'Place unmixed lyophilized vials in cold storage away from direct sunlight.'
          ]
        },
        {
          title: 'Temperature rules',
          paragraphs: [
            'Lyophilized (unmixed powder): Stable at cool room temperature during transit; best preserved refrigerated at 2–8°C for up to 2 years, or frozen at -20°C for longer storage.',
            'Reconstituted liquid: MUST be kept refrigerated at 2–8°C (36–46°F) at all times. Do not freeze once mixed with water.'
          ]
        }
      ]
    },
    {
      id: 'faq',
      icon: '?',
      title: 'Frequently Asked Questions',
      summary: 'Quick answers about ordering, payment, delivery guarantees, and dosage clarity.',
      sections: [
        {
          title: 'Common questions',
          items: [
            'How do I place an order? Browse products, add your selected formulation to cart, and submit checkout.',
            'Are tests and batch records available? Yes, every product batch is backed by an independent third-party HPLC assay.',
            'How long does shipping take? Express couriers typically deliver within 3–5 business days with full tracking.',
            'Can I ask questions about my protocol? Yes, contact our team via the concierge button anytime.'
          ]
        }
      ]
    },
    {
      id: 'about',
      icon: '✦',
      title: 'About Us & Quality Standards',
      summary: 'Our commitment to a premium, private, and deeply supportive wellness experience.',
      sections: [
        {
          title: 'Our mission',
          paragraphs: [
            'Our goal is not simply to provide products. Our mission is to create a premium experience where every customer feels informed, respected, and supported throughout their wellness journey.',
            'Every peptide in our catalog is synthesized under cGMP conditions with validated purity surpassing 99.0%.'
          ]
        }
      ]
    }
  ];

  React.useEffect(() => {
    if (initialTab && initialTab !== 'calculator' && initialTab !== 'ask') {
      const found = guideTopics.find((g) => g.id === initialTab);
      if (found) {
        setActiveGuide(found);
      }
    }
  }, [initialTab]);

  return (
    <div className="min-h-screen bg-[#fffdfb] text-[#0c2340] font-sans">
      
      {/* Education Studio Page Wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] min-h-screen bg-[radial-gradient(circle_at_85%_10%,rgba(247,222,217,0.35)_0,transparent_32%),linear-gradient(135deg,#fffdfb,#f6f4ee)]">
        
        {/* ======================================================== */}
        {/* 1. LEFT SIDEBAR (STICKY STUDIO PANEL)                     */}
        {/* ======================================================== */}
        <aside className="border-r border-[#dfd7c7] bg-[#fffdfb]/90 backdrop-blur-md p-6 sm:p-8 flex flex-col lg:h-screen lg:sticky lg:top-0 z-30">
          
          {/* Studio Brand Monogram */}
          <div className="mb-6">
            <div className="w-full h-28 rounded-2xl bg-gradient-to-br from-[#f6f4ee] to-[#dfd7c7]/60 border border-[#dfd7c7] flex flex-col items-center justify-center p-4 text-center shadow-xs">
              <span className="font-serif text-3xl text-[#c5a059] font-normal leading-none mb-1">✦</span>
              <span className="font-serif text-base font-semibold text-[#0c2340] tracking-tight">Whole Harbor Wellness</span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#5a6b7c] font-semibold">Whole Harbor Studio</span>
            </div>
          </div>

          <p className="text-[10px] uppercase font-bold tracking-widest text-[#c5a059] mb-1">
            EDUCATION STUDIO
          </p>

          <h1 className="font-serif text-3xl text-[#0c2340] font-bold leading-tight mb-2">
            Learn with confidence.
          </h1>

          <p className="text-xs text-[#5a6b7c] leading-relaxed mb-6">
            Clear product education, careful calculations and personal support in one calm place.
          </p>

          {/* Navigation Controls */}
          <nav className="grid gap-2 mb-8">
            <button
              onClick={() => setActiveTab('ask')}
              className={`w-full text-left rounded-xl p-3 text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === 'ask'
                  ? 'bg-[#f6f4ee] text-[#0c2340] border border-[#dfd7c7] shadow-xs'
                  : 'text-[#5a6b7c] hover:text-[#0c2340] hover:bg-[#f6f4ee]/50'
              }`}
            >
              <span className="font-serif text-lg text-[#c5a059]">✦</span>
              <span>Ask Whole Harbor</span>
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              className={`w-full text-left rounded-xl p-3 text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === 'calculator'
                  ? 'bg-[#f6f4ee] text-[#0c2340] border border-[#dfd7c7] shadow-xs'
                  : 'text-[#5a6b7c] hover:text-[#0c2340] hover:bg-[#f6f4ee]/50'
              }`}
            >
              <span className="font-serif text-lg text-[#c5a059]">◇</span>
              <span>Mixing calculator</span>
            </button>

            <button
              onClick={() => navigate('shop')}
              className="w-full text-left rounded-xl p-3 text-xs font-bold text-[#5a6b7c] hover:text-[#0c2340] hover:bg-[#f6f4ee]/50 transition-colors flex items-center gap-3 cursor-pointer"
            >
              <span className="font-serif text-lg text-[#c5a059]">♧</span>
              <span>Shop the catalog</span>
            </button>
          </nav>

          {/* Private by Design Container */}
          <div className="mt-auto pt-4">
            <div className="border border-[#dfd7c7] bg-[#f6f4ee] rounded-xl p-3.5 mb-3 shadow-xs">
              <b className="block text-[11px] font-bold text-[#0c2340]">Private by design</b>
              <p className="text-[10px] text-[#5a6b7c] leading-snug mt-1">
                Your conversation history stays on this device. No medical data is logged or shared.
              </p>
            </div>

            <a
              href="https://wa.me/529841721536?text=Hi%20Kelvin%2C%20I%20have%20a%20question%20about%20Whole%20Harbor%20Wellness."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c5a059] hover:text-[#0c2340] transition-colors"
            >
              <span>Contact Kelvin</span>
              <span>→</span>
            </a>
          </div>

        </aside>

        {/* ======================================================== */}
        {/* 2. RIGHT CONTENT AREA                                     */}
        {/* ======================================================== */}
        <section className="max-w-[1050px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-10">
          
          {/* Top Bar Return Breadcrumb */}
          <header className="flex items-center justify-between pb-6 border-b border-[#dfd7c7] text-xs text-[#5a6b7c]">
            <button
              onClick={() => navigate('shop')}
              className="font-bold text-[#0c2340] hover:text-[#c5a059] flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>←</span>
              <span>Return to storefront</span>
            </button>
            <span className="text-[11px] uppercase tracking-wider text-[#5a6b7c]">
              Product guidance • ordering support
            </span>
          </header>

          {/* ------------------------------------------------------ */}
          {/* VIEW TAB 1: ASK WHOLE HARBOR (GUIDANCE & TOPICS)       */}
          {/* ------------------------------------------------------ */}
          {activeTab === 'ask' && (
            <div className="space-y-10 animate-in fade-in duration-300">
              
              {/* Studio Intro */}
              <div className="pt-6 pb-2">
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#c5a059] mb-2">
                  ASK • LEARN • UNDERSTAND
                </p>
                <h2 className="font-serif text-3xl sm:text-5xl lg:text-[54px] text-[#0c2340] font-bold leading-[1.05] tracking-tight mb-3">
                  Clarity for your wellness questions.
                </h2>
                <p className="text-sm text-[#5a6b7c] max-w-2xl leading-relaxed">
                  Explore the catalog in plain language, understand product status and find the right next question to ask.
                </p>
              </div>

              {/* Interactive Q&A Assistant Console */}
              <div className="bg-white rounded-3xl border border-[#dfd7c7] shadow-md overflow-hidden">
                
                {/* Chat Header */}
                <div className="px-6 py-4 bg-[#f6f4ee] border-b border-[#dfd7c7] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#c5a059] text-white flex items-center justify-center font-serif text-base">
                      ✦
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-bold text-[#0c2340]">Whole Harbor Guidance Desk</h3>
                      <p className="text-[10px] text-[#5a6b7c]">Automated Verified Knowledge &amp; Guidance</p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-[#c5a059]/10 text-[#c5a059]">
                    Active
                  </span>
                </div>

                {/* Messages Feed */}
                <div className="p-6 h-[340px] overflow-y-auto space-y-4 bg-[#fffdfb]/50">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex gap-3 max-w-[85%] ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                          m.sender === 'user' ? 'bg-[#0c2340] text-white' : 'bg-[#c5a059] text-white font-serif'
                        }`}
                      >
                        {m.sender === 'user' ? 'You' : '✦'}
                      </div>
                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line shadow-2xs ${
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
                <div className="px-6 py-2.5 bg-[#f6f4ee]/80 border-t border-[#dfd7c7] flex gap-2 overflow-x-auto no-scrollbar">
                  {qaKnowledge.slice(0, 5).map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAskQuestion(item.query)}
                      className="px-3 py-1.5 rounded-full bg-white border border-[#dfd7c7] text-[10px] font-semibold text-[#0c2340] hover:bg-[#c5a059] hover:text-white transition-colors shrink-0 cursor-pointer shadow-2xs"
                    >
                      {item.query}
                    </button>
                  ))}
                </div>

                {/* Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAskQuestion(inputQuestion);
                  }}
                  className="p-4 bg-white border-t border-[#dfd7c7] flex items-center gap-3"
                >
                  <input
                    type="text"
                    value={inputQuestion}
                    onChange={(e) => setInputQuestion(e.target.value)}
                    placeholder="Ask about mixing, storage, syringes, purity, or orders..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#f6f4ee] border border-[#dfd7c7] text-xs text-[#0c2340] placeholder-[#5a6b7c] focus:outline-none focus:ring-1 focus:ring-[#c5a059]"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#c5a059] text-white text-xs font-bold hover:bg-[#0c2340] transition-colors cursor-pointer shrink-0 shadow-xs"
                  >
                    Send
                  </button>
                </form>

              </div>

              {/* Curated Educational Guides Grid */}
              <div className="pt-4 space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#c5a059]">
                      CORE CLIENT GUIDANCE
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#0c2340] mt-1">
                      Essential Wellness Guides
                    </h3>
                  </div>
                  <span className="text-xs text-[#5a6b7c]">7 Articles</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {guideTopics.map((topic) => (
                    <div
                      key={topic.id}
                      onClick={() => setActiveGuide(topic)}
                      className="bg-white rounded-2xl border border-[#dfd7c7] p-6 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-[#f6f4ee] text-[#c5a059] border border-[#dfd7c7] flex items-center justify-center font-serif text-lg mb-4 group-hover:bg-[#c5a059] group-hover:text-white transition-colors">
                          {topic.icon}
                        </div>
                        <h4 className="font-serif text-lg font-bold text-[#0c2340] mb-1.5 group-hover:text-[#c5a059] transition-colors">
                          {topic.title}
                        </h4>
                        <p className="text-xs text-[#5a6b7c] leading-relaxed line-clamp-3">
                          {topic.summary}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-[#dfd7c7]/60 flex items-center justify-between text-xs text-[#c5a059] font-bold">
                        <span>Read Guide</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ------------------------------------------------------ */}
          {/* VIEW TAB 2: MIXING CALCULATOR                          */}
          {/* ------------------------------------------------------ */}
          {activeTab === 'calculator' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Calculator Intro */}
              <div className="pt-6 pb-2">
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#c5a059] mb-2">
                  ARITHMETIC TOOL
                </p>
                <h2 className="font-serif text-3xl sm:text-5xl lg:text-[54px] text-[#0c2340] font-bold leading-[1.05] tracking-tight mb-3">
                  Mixing calculator
                </h2>
                <p className="text-sm text-[#5a6b7c] max-w-2xl leading-relaxed">
                  Enter the values from your verified instructions to calculate concentration and syringe markings.
                </p>
              </div>

              {/* Quick Preset Buttons */}
              <div className="bg-[#f6f4ee] border border-[#dfd7c7] rounded-2xl p-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#5a6b7c] block mb-2">
                  Quick Formulation Presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => applyPreset('semaglutide')}
                    className="px-3 py-1.5 rounded-lg bg-white border border-[#dfd7c7] text-xs font-semibold text-[#0c2340] hover:bg-[#c5a059] hover:text-white transition-colors cursor-pointer"
                  >
                    Semaglutide 5mg (250mcg dose)
                  </button>
                  <button
                    onClick={() => applyPreset('tirzepatide')}
                    className="px-3 py-1.5 rounded-lg bg-white border border-[#dfd7c7] text-xs font-semibold text-[#0c2340] hover:bg-[#c5a059] hover:text-white transition-colors cursor-pointer"
                  >
                    Tirzepatide 10mg (2.5mg dose)
                  </button>
                  <button
                    onClick={() => applyPreset('bpc157')}
                    className="px-3 py-1.5 rounded-lg bg-white border border-[#dfd7c7] text-xs font-semibold text-[#0c2340] hover:bg-[#c5a059] hover:text-white transition-colors cursor-pointer"
                  >
                    BPC-157 5mg (250mcg dose)
                  </button>
                  <button
                    onClick={() => applyPreset('nad')}
                    className="px-3 py-1.5 rounded-lg bg-white border border-[#dfd7c7] text-xs font-semibold text-[#0c2340] hover:bg-[#c5a059] hover:text-white transition-colors cursor-pointer"
                  >
                    NAD+ 500mg (50mg dose)
                  </button>
                  <button
                    onClick={() => applyPreset('retatrutide')}
                    className="px-3 py-1.5 rounded-lg bg-white border border-[#dfd7c7] text-xs font-semibold text-[#0c2340] hover:bg-[#c5a059] hover:text-white transition-colors cursor-pointer"
                  >
                    Retatrutide 10mg (2mg dose)
                  </button>
                </div>
              </div>

              {/* Calculator 2-Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
                
                {/* Inputs Card */}
                <div className="bg-white border border-[#dfd7c7] rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
                  <h3 className="font-serif text-lg font-bold text-[#0c2340] border-b border-[#dfd7c7] pb-3">
                    Reconstitution Parameters
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Vial Amount */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0c2340] flex justify-between">
                        <span>Vial amount</span>
                        <span className="text-[#5a6b7c] font-normal">mg</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={vialAmount}
                        onChange={(e) => setVialAmount(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#fffdfb] border border-[#dfd7c7] text-xs font-semibold text-[#0c2340] focus:outline-none focus:ring-1 focus:ring-[#c5a059]"
                      />
                    </div>

                    {/* Final Mixing Volume */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0c2340] flex justify-between">
                        <span>Final mixing volume</span>
                        <span className="text-[#5a6b7c] font-normal">mL</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={mixingVolume}
                        onChange={(e) => setMixingVolume(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#fffdfb] border border-[#dfd7c7] text-xs font-semibold text-[#0c2340] focus:outline-none focus:ring-1 focus:ring-[#c5a059]"
                      />
                    </div>

                    {/* Syringe Scale */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0c2340]">
                        Syringe scale
                      </label>
                      <select
                        value={syringeScale}
                        onChange={(e) => setSyringeScale(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#fffdfb] border border-[#dfd7c7] text-xs font-semibold text-[#0c2340] focus:outline-none focus:ring-1 focus:ring-[#c5a059]"
                      >
                        <option value="U-100">U-100 (Standard Insulin)</option>
                        <option value="U-40">U-40 (40 Units/mL)</option>
                        <option value="Tuberculin">Tuberculin (1 mL Hundredths)</option>
                      </select>
                    </div>

                    {/* Purity / COA */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0c2340] flex justify-between">
                        <span>Purity / COA</span>
                        <span className="text-[#5a6b7c] font-normal">% (optional)</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={purity}
                        onChange={(e) => setPurity(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#fffdfb] border border-[#dfd7c7] text-xs font-semibold text-[#0c2340] focus:outline-none focus:ring-1 focus:ring-[#c5a059]"
                      />
                    </div>
                  </div>

                  {/* Dose Input */}
                  <div className="pt-2 space-y-1.5">
                    <label className="text-xs font-bold text-[#0c2340] block">
                      Amount from verified instructions
                    </label>
                    <div className="grid grid-cols-[1fr_100px] gap-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={doseAmount}
                        onChange={(e) => setDoseAmount(Number(e.target.value))}
                        className="px-3.5 py-2.5 rounded-xl bg-[#fffdfb] border border-[#dfd7c7] text-xs font-semibold text-[#0c2340] focus:outline-none focus:ring-1 focus:ring-[#c5a059]"
                      />
                      <select
                        value={doseUnit}
                        onChange={(e) => setDoseUnit(e.target.value as any)}
                        className="px-3 py-2.5 rounded-xl bg-[#fffdfb] border border-[#dfd7c7] text-xs font-semibold text-[#0c2340] focus:outline-none focus:ring-1 focus:ring-[#c5a059]"
                      >
                        <option value="mcg">mcg</option>
                        <option value="mg">mg</option>
                      </select>
                    </div>
                  </div>

                </div>

                {/* Results Card */}
                <div className="bg-white border border-[#dfd7c7] rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#c5a059]">
                    CALCULATED RESULT
                  </p>

                  {/* Draw to Callout Highlight Box */}
                  <div className="rounded-2xl p-6 bg-gradient-to-br from-[#0c2340] to-[#c5a059] text-white shadow-lg space-y-1">
                    <small className="text-[10px] uppercase tracking-wider text-[#dfd7c7]/90 font-semibold block">
                      Draw to
                    </small>
                    <strong className="font-serif text-5xl sm:text-6xl font-bold leading-none block my-1">
                      {Number.isFinite(calcResults.drawUnits) ? calcResults.drawUnits.toFixed(2) : '—'}
                    </strong>
                    <span className="text-xs text-[#dfd7c7] font-medium block">
                      {syringeScale === 'Tuberculin'
                        ? 'hundredths on a 1 mL scale'
                        : `${syringeScale} syringe units`}
                    </span>
                  </div>

                  {/* Metrics Definition List */}
                  <dl className="divide-y divide-[#dfd7c7] text-xs">
                    <div className="py-2.5 flex justify-between">
                      <dt className="text-[#5a6b7c]">Concentration</dt>
                      <dd className="font-bold text-[#0c2340] tabular-nums">
                        {calcResults.concentration.toFixed(3)} mg/mL
                      </dd>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <dt className="text-[#5a6b7c]">Liquid to draw</dt>
                      <dd className="font-bold text-[#0c2340] tabular-nums">
                        {calcResults.liquidToDrawMl.toFixed(3)} mL
                      </dd>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <dt className="text-[#5a6b7c]">Amount per syringe unit</dt>
                      <dd className="font-bold text-[#0c2340] tabular-nums">
                        {calcResults.amountPerUnitMcg.toFixed(2)} mcg
                      </dd>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <dt className="text-[#5a6b7c]">Effective vial amount</dt>
                      <dd className="font-bold text-[#0c2340] tabular-nums">
                        {calcResults.effectiveMg.toFixed(2)} mg
                      </dd>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <dt className="text-[#5a6b7c]">Total syringe units in vial</dt>
                      <dd className="font-bold text-[#0c2340] tabular-nums">
                        {calcResults.totalUnitsInVial.toFixed(1)} units
                      </dd>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <dt className="text-[#5a6b7c]">Estimated doses in vial</dt>
                      <dd className="font-bold text-[#c5a059] tabular-nums">
                        ~{calcResults.dosesPerVial} doses
                      </dd>
                    </div>
                  </dl>

                </div>

              </div>

              {/* Warning Disclaimer Card */}
              <div className="border border-[#dfd7c7] bg-[#f6f4ee] rounded-2xl p-5 flex items-start gap-4">
                <span className="w-8 h-8 rounded-full bg-white text-[#c5a059] border border-[#dfd7c7] flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                  !
                </span>
                <div className="space-y-1 text-xs">
                  <b className="font-bold text-[#0c2340] block">
                    Arithmetic only — not a dose recommendation.
                  </b>
                  <p className="text-[#5a6b7c] leading-relaxed">
                    This tool calculates from the numbers you enter. Confirm the vial label, final mixing volume, syringe scale and intended amount with verified instructions and a licensed clinician or pharmacist before use. Do not guess.
                  </p>
                </div>
              </div>

            </div>
          )}

        </section>

      </div>

      {/* ======================================================== */}
      {/* 3. GUIDE DETAIL MODAL (IN-DEPTH READER)                  */}
      {/* ======================================================== */}
      {activeGuide && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#fffdfb] max-w-2xl w-full rounded-3xl border border-[#dfd7c7] shadow-2xl p-6 sm:p-8 space-y-6 relative animate-in fade-in zoom-in-95">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#dfd7c7] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#f6f4ee] text-[#c5a059] border border-[#dfd7c7] flex items-center justify-center font-serif text-xl">
                  {activeGuide.icon}
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#0c2340]">
                    {activeGuide.title}
                  </h3>
                  <p className="text-xs text-[#5a6b7c]">{activeGuide.summary}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveGuide(null)}
                className="w-8 h-8 rounded-full bg-[#f6f4ee] hover:bg-[#dfd7c7] text-[#0c2340] flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content Sections */}
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {activeGuide.sections.map((sec, idx) => (
                <div key={idx} className="space-y-2.5">
                  <h4 className="font-serif text-lg font-bold text-[#0c2340]">
                    {sec.title}
                  </h4>
                  {sec.paragraphs?.map((p, pIdx) => (
                    <p key={pIdx} className="text-xs sm:text-sm text-[#5a6b7c] leading-relaxed">
                      {p}
                    </p>
                  ))}
                  {sec.items && (
                    <ul className="space-y-1.5 pl-4 list-disc text-xs sm:text-sm text-[#5a6b7c] leading-relaxed marker:text-[#c5a059]">
                      {sec.items.map((it, itIdx) => (
                        <li key={itIdx}>{it}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-[#dfd7c7] flex justify-end">
              <button
                onClick={() => setActiveGuide(null)}
                className="px-6 py-2.5 rounded-xl bg-[#c5a059] text-white text-xs font-semibold hover:bg-[#0c2340] transition-colors cursor-pointer"
              >
                Close Guide
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
