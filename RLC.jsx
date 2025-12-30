import React, { useState, useEffect, useRef } from 'react';

// KaTeX Formula Component
const KatexFormula = ({ tex, isLoaded }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (isLoaded && window.katex && containerRef.current) {
      try {
        window.katex.render(tex, containerRef.current, {
          throwOnError: false,
          displayMode: true, // 数式をブロック表示で見やすくする
          macros: {
            "\\dot": "dot", // ドット記法を明示
            "\\j": "j"        // 電気工学では虚数単位に j を使うため
          }
        });
      } catch (e) {
        console.error("KaTeX render error:", e);
        containerRef.current.innerText = tex;
      }
    }
  }, [tex, isLoaded]);

  return <div ref={containerRef} className="py-1 overflow-x-auto overflow-y-hidden" />;
};

const RLCCircuitExplorer = () => {
  const [circuitType, setCircuitType] = useState('series'); // 'series' or 'parallel'
  const [selectedElement, setSelectedElement] = useState(null);
  const [katexLoaded, setKatexLoaded] = useState(false);

  // Load KaTeX dynamically
  useEffect(() => {
    // CSS
    if (!document.getElementById('katex-css')) {
      const link = document.createElement('link');
      link.id = 'katex-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
      document.head.appendChild(link);
    }

    // JS
    if (!document.getElementById('katex-js')) {
      const script = document.createElement('script');
      script.id = 'katex-js';
      script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
      script.onload = () => setKatexLoaded(true);
      document.head.appendChild(script);
    } else if (window.katex) {
      setKatexLoaded(true);
    } else {
      // Script tag exists but window.katex might not be ready, check periodically
      const interval = setInterval(() => {
        if (window.katex) {
          setKatexLoaded(true);
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  // 回路要素のデータと数式 (LaTeX形式に最適化)
  const circuitData = {
    series: {
      title: "RLC 直列回路 (Series)",
      description: "電流 I が共通で、電圧が各素子に分圧される回路。",
      elements: {
        source: {
          name: "交流電源 (Source)",
          symbol: "V(t)",
          formulas: [
            { label: "回路方程式 (KVL)", text: "V(t) = V_R + V_L + V_C" },
            { label: "インピーダンス Z", text: "Z = R + j\\left(\\omega L - \\frac{1}{\\omega C}\\right)" },
            { label: "全体電流 I (フェーザ)", text: "\\dot{I} = \\frac{\\dot{V}}{Z}" },
            { label: "位相角 \\phi", text: "\\tan \\phi = \\frac{\\omega L - \\frac{1}{\\omega C}}{R}" }
          ]
        },
        R: {
          name: "抵抗 (Resistor)",
          symbol: "R",
          formulas: [
            { label: "電圧 V_R (時間領域)", text: "v_R(t) = R \\cdot i(t)" },
            { label: "フェーザ電圧", text: "\\dot{V}_R = R \\dot{I}" },
            { label: "特徴", text: "\\text{電流と電圧は同相 } (\\phi = 0)" }
          ]
        },
        L: {
          name: "コイル (Inductor)",
          symbol: "L",
          formulas: [
            { label: "電圧 V_L (微分)", text: "v_L(t) = L \\frac{di(t)}{dt}" },
            { label: "フェーザ電圧", text: "\\dot{V}_L = j\\omega L \\dot{I}" },
            { label: "特徴", text: "\\text{電圧は電流より } 90^\\circ (\\frac{\\pi}{2}) \\text{ 進む}" }
          ]
        },
        C: {
          name: "コンデンサ (Capacitor)",
          symbol: "C",
          formulas: [
            { label: "電圧 V_C (積分)", text: "v_C(t) = \\frac{1}{C} \\int i(t) dt" },
            { label: "フェーザ電圧", text: "\\dot{V}_C = \\frac{1}{j\\omega C} \\dot{I} = -j \\frac{1}{\\omega C} \\dot{I}" },
            { label: "特徴", text: "\\text{電圧は電流より } 90^\\circ (\\frac{\\pi}{2}) \\text{ 遅れる}" }
          ]
        }
      }
    },
    parallel: {
      title: "RLC 並列回路 (Parallel)",
      description: "電圧 V が共通で、電流が各素子に分流される回路。",
      elements: {
        source: {
          name: "交流電源 (Source)",
          symbol: "I(t)",
          formulas: [
            { label: "回路方程式 (KCL)", text: "I(t) = i_R + i_L + i_C" },
            { label: "アドミタンス Y", text: "Y = \\frac{1}{R} + j\\left(\\omega C - \\frac{1}{\\omega L}\\right)" },
            { label: "全体電圧 V (フェーザ)", text: "\\dot{V} = \\frac{\\dot{I}}{Y}" },
            { label: "位相角 \\phi", text: "\\tan \\phi = R\\left(\\omega C - \\frac{1}{\\omega L}\\right)" }
          ]
        },
        R: {
          name: "抵抗 (Resistor)",
          symbol: "R",
          formulas: [
            { label: "電流 i_R (時間領域)", text: "i_R(t) = \\frac{v(t)}{R}" },
            { label: "フェーザ電流", text: "\\dot{I}_R = \\frac{\\dot{V}}{R} = G \\dot{V}" },
            { label: "特徴", text: "\\text{電圧と電流は同相}" }
          ]
        },
        L: {
          name: "コイル (Inductor)",
          symbol: "L",
          formulas: [
            { label: "電流 i_L (積分)", text: "i_L(t) = \\frac{1}{L} \\int v(t) dt" },
            { label: "フェーザ電流", text: "\\dot{I}_L = \\frac{\\dot{V}}{j\\omega L} = -j \\frac{1}{\\omega L} \\dot{V}" },
            { label: "特徴", text: "\\text{電流は電圧より } 90^\\circ \\text{ 遅れる}" }
          ]
        },
        C: {
          name: "コンデンサ (Capacitor)",
          symbol: "C",
          formulas: [
            { label: "電流 i_C (微分)", text: "i_C(t) = C \\frac{dv(t)}{dt}" },
            { label: "フェーザ電流", text: "\\dot{I}_C = j\\omega C \\dot{V}" },
            { label: "特徴", text: "\\text{電流は電圧より } 90^\\circ \\text{ 進む}" }
          ]
        }
      }
    }
  };

  const handleElementClick = (elementKey) => {
    setSelectedElement(elementKey);
  };

  // SVG Components helper
  const SvgWrapper = ({ children, viewBox = "0 0 400 200" }) => (
    <svg viewBox={viewBox} className="w-full h-full drop-shadow-lg bg-slate-50 rounded-lg border border-slate-200">
      {children}
    </svg>
  );

  const ComponentBox = ({ x, y, width, height, label, type, onClick, isSelected }) => {
    const strokeColor = isSelected ? "#2563eb" : "#334155";
    const strokeWidth = isSelected ? 3 : 2;
    const fillColor = isSelected ? "#dbeafe" : "transparent";

    return (
      <g onClick={() => onClick(type)} className="cursor-pointer transition-all duration-200 group">
        {/* Click area (invisible but larger) */}
        <rect x={x - 10} y={y - 10} width={width + 20} height={height + 20} fill="transparent" />

        {/* Visual Background for selection */}
        <rect x={x} y={y} width={width} height={height} rx="4" fill={fillColor} stroke="transparent" />

        {/* Electrical Symbol Drawing */}
        {type === 'source' && (
          <g transform={`translate(${x + width / 2}, ${y + height / 2})`}>
            <circle r="15" fill="white" stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d="M -8 0 Q -4 -8 0 0 T 8 0" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        )}
        {type === 'R' && (
          <g transform={`translate(${x}, ${y + height / 2})`}>
            <path d={`M 0 0 L 5 0 L 10 -10 L 20 10 L 30 -10 L 40 10 L 50 -10 L 55 0 L ${width} 0`} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round" />
          </g>
        )}
        {type === 'L' && (
          <g transform={`translate(${x}, ${y + height / 2})`}>
            <path d={`M 0 0 L 10 0 Q 15 -15 20 0 Q 25 -15 30 0 Q 35 -15 40 0 Q 45 -15 50 0 L ${width} 0`} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
          </g>
        )}
        {type === 'C' && (
          <g transform={`translate(${x + width / 2}, ${y + height / 2})`}>
            <line x1="-15" y1="0" x2="-4" y2="0" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="4" y1="0" x2="15" y2="0" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="-4" y1="-12" x2="-4" y2="12" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="4" y1="-12" x2="4" y2="12" stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        )}

        {/* Label */}
        <text x={x + width / 2} y={y - 10} textAnchor="middle" className={`text-sm font-bold ${isSelected ? 'fill-blue-600' : 'fill-slate-600'}`}>
          {label}
        </text>
      </g>
    );
  };

  const Wire = ({ d }) => (
    <path d={d} stroke="#334155" strokeWidth="2" fill="none" />
  );

  return (
    <div className="flex flex-col h-screen bg-slate-100 text-slate-800 font-sans">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 shadow-md flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          RLC Circuit Analyzer (KaTeX Mode)
        </h1>
        <div className="flex bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => { setCircuitType('series'); setSelectedElement(null); }}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${circuitType === 'series' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
          >
            直列 (Series)
          </button>
          <button
            onClick={() => { setCircuitType('parallel'); setSelectedElement(null); }}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${circuitType === 'parallel' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
          >
            並列 (Parallel)
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Left Panel: Visualization */}
        <div className="flex-1 p-6 flex flex-col items-center justify-center bg-white border-b md:border-b-0 md:border-r border-slate-200 relative">
          <div className="absolute top-4 left-4 bg-yellow-50 border-l-4 border-yellow-400 p-2 text-xs text-yellow-800 max-w-xs opacity-80 hover:opacity-100 transition-opacity z-10">
            <p className="font-bold">Advisor's Note:</p>
            微分($d/dt$)や積分($\int$)、虚数単位($j$)の表記が正確になった。式の「形」をただ見るな。物理的意味（エネルギーの蓄積か、消費か）を読み取れ。
          </div>

          <div className="w-full max-w-lg aspect-[2/1] relative">
            <SvgWrapper>
              {circuitType === 'series' ? (
                <>
                  {/* Series Wires */}
                  <Wire d="M 50 100 L 50 50 L 110 50" /> {/* Source to R */}
                  <Wire d="M 170 50 L 210 50" />          {/* R to L */}
                  <Wire d="M 270 50 L 310 50" />          {/* L to C */}
                  <Wire d="M 340 50 L 350 50 L 350 150 L 50 150 L 50 100" /> {/* C back to Source */}

                  <ComponentBox x={20} y={60} width={60} height={80} label="Source" type="source"
                    onClick={handleElementClick} isSelected={selectedElement === 'source'} />

                  <ComponentBox x={110} y={20} width={60} height={60} label="R" type="R"
                    onClick={handleElementClick} isSelected={selectedElement === 'R'} />

                  <ComponentBox x={210} y={20} width={60} height={60} label="L" type="L"
                    onClick={handleElementClick} isSelected={selectedElement === 'L'} />

                  <ComponentBox x={310} y={20} width={30} height={60} label="C" type="C"
                    onClick={handleElementClick} isSelected={selectedElement === 'C'} />
                </>
              ) : (
                <>
                  {/* Parallel Wires */}
                  <Wire d="M 50 100 L 50 50 L 350 50" /> {/* Top Rail */}
                  <Wire d="M 50 100 L 50 150 L 350 150" /> {/* Bottom Rail */}

                  {/* Vertical drops */}
                  <Wire d="M 150 50 L 150 80" />
                  <Wire d="M 150 120 L 150 150" />

                  <Wire d="M 250 50 L 250 80" />
                  <Wire d="M 250 120 L 250 150" />

                  <Wire d="M 350 50 L 350 80" />
                  <Wire d="M 350 120 L 350 150" />

                  <ComponentBox x={20} y={60} width={60} height={80} label="Source" type="source"
                    onClick={handleElementClick} isSelected={selectedElement === 'source'} />

                  <ComponentBox x={120} y={80} width={60} height={40} label="R" type="R"
                    onClick={handleElementClick} isSelected={selectedElement === 'R'} />

                  <ComponentBox x={220} y={80} width={60} height={40} label="L" type="L"
                    onClick={handleElementClick} isSelected={selectedElement === 'L'} />

                  <ComponentBox x={335} y={80} width={30} height={40} label="C" type="C"
                    onClick={handleElementClick} isSelected={selectedElement === 'C'} />
                </>
              )}
            </SvgWrapper>
            <p className="text-center mt-4 text-slate-500 text-sm">
              要素（R, L, C, 電源）をタップして詳細を表示
            </p>
          </div>
        </div>

        {/* Right Panel: Info & Formulas */}
        <div className="w-full md:w-96 bg-slate-50 p-6 overflow-y-auto border-l border-slate-200 shadow-inner">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">{circuitData[circuitType].title}</h2>
            <p className="text-slate-600 text-sm">{circuitData[circuitType].description}</p>
          </div>

          {!selectedElement ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 border-2 border-dashed border-slate-300 rounded-lg">
              <p>回路図の要素を選択してください</p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-3 mb-4 pb-2 border-b border-slate-200">
                
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {circuitData[circuitType].elements[selectedElement].name}
                  </h3>
                  <span className="text-xs font-mono bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
                    Symbol: {circuitData[circuitType].elements[selectedElement].symbol}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {circuitData[circuitType].elements[selectedElement].formulas.map((formula, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      {formula.label}
                    </p>
                    <div className="text-slate-800">
                      {katexLoaded ? (
                        <KatexFormula tex={formula.text} isLoaded={katexLoaded} />
                      ) : (
                        <div className="font-mono text-sm text-slate-400">Loading formula...</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-3 bg-blue-50 text-blue-800 text-sm rounded border border-blue-100">
                <strong>Point:</strong>
                {katexLoaded
                  ? <KatexFormula tex="V_L = L \frac{di}{dt}" isLoaded={true} />
                  : "数式を確認せよ"}
                のような微分形こそが、コイルが「急な電流変化を嫌う」物理的理由だ。
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RLCCircuitExplorer;