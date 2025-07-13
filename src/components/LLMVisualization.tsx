import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, ChevronRight, Brain, Zap, Eye, MessageSquare, SlidersHorizontal } from 'lucide-react';

import type { Token, Step } from '../types/types';

const LLMVisualization: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>("The quick brown fox");
  const [tokens, setTokens] = useState<string[]>([]);
  const [embeddings, setEmbeddings] = useState<Token[]>([]);
  const [attentionWeights, setAttentionWeights] = useState<number[][]>([]);
  const [output, setOutput] = useState<string>("");
  const [animationSpeed, setAnimationSpeed] = useState<number>(2000);
  const [embeddingDimension, setEmbeddingDimension] = useState<number>(8);

  const visualizationContentRef = useRef<HTMLDivElement>(null);

  const steps: Step[] = [
    { name: "Input Text", icon: MessageSquare, description: "Raw text input" },
    { name: "Tokenization", icon: Zap, description: "Breaking text into tokens" },
    { name: "Embeddings", icon: Brain, description: "Converting tokens to vectors" },
    { name: "Attention", icon: Eye, description: "Computing attention weights" },
    { name: "Generation", icon: ChevronRight, description: "Generating output" }
  ];

  const tokenizeText = (text: string): string[] => {
    return text.toLowerCase().split(/[\s,.!?;:'"()-]+/g).filter(word => word.length > 0);
  };

  const generateEmbeddings = (tokenList: string[], dimension: number): Token[] => {
    const embeddingCache = new Map<string, number[]>();

    return tokenList.map(token => {
      if (embeddingCache.has(token)) {
        return { token, vector: embeddingCache.get(token)! };
      }
      
      const tokenHash = token.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const vector = Array.from({ length: dimension }, (_, i) => {
        return parseFloat((Math.sin((tokenHash + i * 10) / 50) * Math.cos(i / 3) * 2).toFixed(3));
      });
      embeddingCache.set(token, vector);
      return { token, vector };
    });
  };

  const generateAttentionWeights = (tokenList: string[]): number[][] => {
    const weights: number[][] = [];
    for (let i = 0; i < tokenList.length; i++) {
      const row: number[] = [];
      let sum = 0;
      for (let j = 0; j < tokenList.length; j++) {
        let weight = Math.random() * 0.1;
        if (i === j) {
          weight += 0.7;
        } else if (Math.abs(i - j) <= 1) {
          weight += 0.2;
        } else if (tokenList[i] === tokenList[j] && tokenList[i].length > 1) {
            weight += 0.3;
        } else if (Math.random() < 0.1) {
            weight += Math.random() * 0.2;
        }
        row.push(parseFloat(weight.toFixed(3)));
        sum += weight;
      }
      weights.push(row.map(w => parseFloat((w / sum).toFixed(3))));
    }
    return weights;
  };

  const generateSimpleOutput = (input: string, currentTokens: string[], currentEmbeddings: Token[]): string => {
    if (currentTokens.length === 0) return "Start typing to generate output...";

    const lastToken = currentTokens[currentTokens.length - 1];
    let generatedPart = "";

    if (input.toLowerCase().includes("hello")) {
      generatedPart = "Hey there! How can I assist you today?";
    } else if (input.toLowerCase().includes("question")) {
      generatedPart = "I'm ready to answer your question!";
    } else if (input.toLowerCase().includes("name")) {
      generatedPart = "My name is LLM-Vis. What's yours?";
    } else if (input.toLowerCase().includes("weather")) {
      generatedPart = "The weather is simulated to be sunny.";
    } else if (input.toLowerCase().includes("time")) {
      generatedPart = `It's currently ${new Date().toLocaleTimeString()} here.`;
    } else if (currentTokens.length > 3) {
      switch (lastToken) {
        case "fox": generatedPart = "jumps over the lazy dog."; break;
        case "quick": generatedPart = "brown fox jumps."; break;
        case "brown": generatedPart = "fox is fast."; break;
        case "apple": generatedPart = "is a delicious fruit."; break;
        case "cat": generatedPart = "sits quietly."; break;
        case "dog": generatedPart = "barks loudly."; break;
        case "computer": generatedPart = "is a powerful tool."; break;
        case "data": generatedPart = "is the new oil."; break;
        default:
          const randomPhrase = [
            "What comes next?",
            "Thinking about that...",
            "A fascinating input!",
            "Let's see...",
            "Processing the tokens now."
          ][Math.floor(Math.random() * 5)];
          generatedPart = `... and then ${lastToken} leads to: ${randomPhrase}`;
          break;
      }
    } else {
        generatedPart = "Please provide more context.";
    }

    if (currentTokens.length < 3 && currentStep === 4) {
        generatedPart = "Input is a bit short. Could you elaborate?";
    } else if (currentTokens.length > 7 && Math.random() > 0.5) {
        generatedPart += " A lot to think about!";
    }

    return generatedPart;
  };

  useEffect(() => {
    let timer: number; 
    if (isPlaying && currentStep < steps.length - 1) {
      timer = setTimeout(() => {
        setCurrentStep(prevStep => prevStep + 1);
      }, animationSpeed);
    } else if (currentStep === steps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [currentStep, isPlaying, steps.length, animationSpeed]);

  useEffect(() => {
    if (isPlaying && visualizationContentRef.current) {
      visualizationContentRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [isPlaying]);

  useEffect(() => {
    const tokenList = tokenizeText(inputText);
    setTokens(tokenList);

    if (currentStep >= 2) {
      setEmbeddings(generateEmbeddings(tokenList, embeddingDimension));
    } else {
      setEmbeddings([]);
    }

    if (currentStep >= 3) {
      setAttentionWeights(generateAttentionWeights(tokenList));
    } else {
      setAttentionWeights([]);
    }

    if (currentStep >= 4) {
      setOutput(generateSimpleOutput(inputText, tokenList, embeddings));
    } else {
      setOutput("");
    }

  }, [inputText, currentStep, embeddingDimension]);

  const handlePlay = (): void => {
    if (!isPlaying && currentStep === steps.length - 1) {
      setCurrentStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleReset = (): void => {
    setCurrentStep(0);
    setIsPlaying(false);
    setInputText("The quick brown fox");
  };

  const handleStepClick = (stepIndex: number): void => {
    setCurrentStep(stepIndex);
    setIsPlaying(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setInputText(e.target.value);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setAnimationSpeed(Number(e.target.value));
  };

  const handleEmbeddingDimensionChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setEmbeddingDimension(Number(e.target.value));
  };

  const TokenVisualization: React.FC = () => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
        <Zap className="mr-2 text-blue-500" size={20} />
        Tokenization
      </h3>
      <div className="flex flex-wrap gap-3 min-h-[60px]">
        {tokens.map((token, i) => (
          <div
            key={i}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-500 transform hover:scale-105 ${
              currentStep >= 1
                ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-md animate-token-appear'
                : 'bg-gray-200 text-gray-500'
            }`}
            style={{
              animationDelay: `${i * 100}ms`,
            }}
          >
            {token}
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-600 mt-4 bg-gray-50 p-3 rounded-lg">
        💡 Text is broken down into smaller units (tokens). Punctuation often gets its own token!
      </p>
    </div>
  );

  const EmbeddingVisualization: React.FC = () => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
        <Brain className="mr-2 text-purple-500" size={20} />
        Embeddings (Dim: {embeddingDimension})
      </h3>
      <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
        {embeddings.map((emb, i) => (
          <div key={i} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-24 text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full text-center truncate">
              {emb.token}
            </div>
            <div className="flex flex-wrap gap-0.5 max-w-[calc(100%-100px)]">
              {emb.vector.map((val, j) => (
                <div
                  key={j}
                  className={`w-4 h-4 rounded-sm transition-all duration-500 shadow-sm hover:shadow-md ${
                    currentStep >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                  }`}
                  style={{
                    backgroundColor: val > 0
                      ? `rgba(59, 130, 246, ${Math.min(1, Math.abs(val))})`
                      : `rgba(239, 68, 68, ${Math.min(1, Math.abs(val))})`,
                    animationDelay: `${(i * 50) + (j * 10)}ms`
                  }}
                  title={val.toFixed(2)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-600 mt-4 bg-gray-50 p-3 rounded-lg">
        🔢 Each token is converted to a high-dimensional vector representing its meaning.
      </p>
    </div>
  );

  const AttentionVisualization: React.FC = () => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
        <Eye className="mr-2 text-green-500" size={20} />
        Attention Mechanism
      </h3>
      <div className="overflow-x-auto bg-gray-50 rounded-lg p-4">
        <table className="w-full min-w-max">
          <thead>
            <tr>
              <th className="w-16 p-2 sticky left-0 bg-gray-50 z-10"></th>
              {tokens.map((token, i) => (
                <th key={i} className="px-3 py-2 text-xs font-bold text-gray-700 bg-gray-100 rounded-t-lg rotate-45 origin-bottom-left whitespace-nowrap">
                  {token}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {attentionWeights.map((row, i) => (
              <tr key={i}>
                <td className="px-3 py-2 text-xs font-bold text-gray-700 bg-gray-100 rounded-l-lg sticky left-0 z-10">
                  {tokens[i]}
                </td>
                {row.map((weight, j) => (
                  <td key={j} className="p-0.5">
                    <div
                      className={`w-8 h-8 rounded-lg transition-all duration-500 border border-gray-200 flex items-center justify-center text-[8px] font-mono ${
                        currentStep >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                      }`}
                      style={{
                        backgroundColor: `rgba(34, 197, 94, ${weight})`,
                        animationDelay: `${(i * 50) + (j * 10)}ms`
                      }}
                      title={`Weight: ${weight.toFixed(3)}`}
                    >
                        {weight > 0.05 ? weight.toFixed(2) : ''}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-gray-600 mt-4 bg-gray-50 p-3 rounded-lg">
        👁️ Attention weights show how much each token "pays attention" to others. Darker green means higher attention.
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 p-4">
      <style>{`
        @keyframes token-appear {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-token-appear {
          animation: token-appear 0.5s ease-out forwards;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #4F46E5;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.5);
          transition: background 0.3s ease, transform 0.1s ease;
        }

        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #4F46E5;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.5);
          transition: background 0.3s ease, transform 0.1s ease;
        }

        input[type="range"]::-webkit-slider-thumb:hover {
          background: #3730A3;
          transform: scale(1.1);
        }

        input[type="range"]::-moz-range-thumb:hover {
          background: #3730A3;
          transform: scale(1.1);
        }

        input[type="range"].range-thumb-purple::-webkit-slider-thumb {
          background: #9333ea;
          box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.5);
        }
        input[type="range"].range-thumb-purple::-moz-range-thumb {
          background: #9333ea;
          box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.5);
        }
        input[type="range"].range-thumb-purple::-webkit-slider-thumb:hover {
          background: #7e22ce;
        }
        input[type="range"].range-thumb-purple::-moz-range-thumb:hover {
          background: #7e22ce;
        }
      `}</style>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            How Large Language Models Work
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto z-10">
            Interactive visualization of LLM processing pipeline - from text to intelligence
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-6 mb-8 border border-gray-200">
          <div className="flex flex-col lg:flex-row items-center justify-between mb-6 space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePlay}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                  isPlaying
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                    : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                }`}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
              <button
                onClick={handleReset}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <RotateCcw size={20} />
                <span>Reset</span>
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full lg:w-auto">
              <label htmlFor="input-text" className="text-sm font-bold text-gray-700 whitespace-nowrap">
                Input Text:
              </label>
              <input
                id="input-text"
                type="text"
                value={inputText}
                onChange={handleInputChange}
                className="px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 shadow-sm w-full max-w-sm"
                placeholder="Enter text to process..."
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg shadow-inner mb-6">
            <h4 className="text-lg font-bold text-gray-700 flex items-center mb-4">
              <SlidersHorizontal className="mr-2 text-indigo-500" size={18} />
              Simulation Settings
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="animation-speed" className="block text-sm font-medium text-gray-700 mb-1">
                  Animation Speed ({animationSpeed / 1000}s per step)
                </label>
                <input
                  id="animation-speed"
                  type="range"
                  min="500"
                  max="3000"
                  step="100"
                  value={animationSpeed}
                  onChange={handleSpeedChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <label htmlFor="embedding-dimension" className="block text-sm font-medium text-gray-700 mb-1">
                  Embedding Dimension ({embeddingDimension})
                </label>
                <input
                  id="embedding-dimension"
                  type="range"
                  min="4"
                  max="20"
                  step="1"
                  value={embeddingDimension}
                  onChange={handleEmbeddingDimensionChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-thumb-purple"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 lg:gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index <= currentStep;
              const isCurrent = index === currentStep;
              
              return (
                <button
                  key={index}
                  onClick={() => handleStepClick(index)}
                  className={`flex flex-col items-center space-y-2 p-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                    isActive
                      ? isCurrent
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl scale-105'
                        : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 hover:from-blue-200 hover:to-blue-300 shadow-lg'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200 shadow-md'
                  }`}
                >
                  <Icon size={24} />
                  <span className="text-sm font-bold text-center">{step.name}</span>
                  <span className="text-xs text-center opacity-75 hidden lg:block">{step.description}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <div ref={visualizationContentRef} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
              <MessageSquare className="mr-2 text-blue-500" size={20} />
              Input Text
            </h3>
            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border-2 border-gray-200">
              <p className="text-lg font-mono text-gray-800 break-words">{inputText}</p>
            </div>
            <p className="text-sm text-gray-600 mt-4 bg-gray-50 p-3 rounded-lg">
              📝 The raw text that will be processed by the language model. Try changing it!
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
              <ChevronRight className="mr-2 text-green-500" size={20} />
              Generated Output
            </h3>
            <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-200">
              <p className={`text-lg font-mono text-gray-800 transition-all duration-1000 ${
                currentStep >= 4 ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform translate-x-4'
              }`}>
                {output || "Output will appear here once the 'Generation' step is reached."}
              </p>
            </div>
            <p className="text-sm text-gray-600 mt-4 bg-gray-50 p-3 rounded-lg">
              🎯 The model's predicted continuation of the input text based on its internal (simulated) logic.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          {currentStep >= 1 && <TokenVisualization />}
          {currentStep >= 2 && <EmbeddingVisualization />}
        </div>

        {currentStep >= 3 && (
          <div className="mb-8">
            <AttentionVisualization />
          </div>
        )}

        <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-200">
          <h3 className="text-2xl font-bold mb-6 text-gray-800 text-center">Understanding the Process</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 hover:shadow-lg transition-shadow duration-300">
              <h4 className="font-bold text-blue-900 mb-3 text-lg">🔤 Tokenization</h4>
              <p className="text-sm text-blue-800 leading-relaxed">
                Text is broken down into smaller units (tokens) that the model can process. This could be words, subwords, or characters depending on the tokenizer.
              </p>
            </div>
            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200 hover:shadow-lg transition-shadow duration-300">
              <h4 className="font-bold text-purple-900 mb-3 text-lg">🧠 Embeddings</h4>
              <p className="text-sm text-purple-800 leading-relaxed">
                Each token is converted into a high-dimensional numerical vector that captures semantic meaning and relationships. Words with similar meanings have similar vectors.
              </p>
            </div>
            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200 hover:shadow-lg transition-shadow duration-300">
              <h4 className="font-bold text-green-900 mb-3 text-lg">👁️ Attention</h4>
              <p className="text-sm text-green-800 leading-relaxed">
                The model learns which tokens are most relevant to each other, allowing it to understand context and long-range dependencies in the input sequence.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LLMVisualization;