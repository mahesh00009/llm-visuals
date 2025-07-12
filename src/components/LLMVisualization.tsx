import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ChevronRight, Brain, Zap, Eye, MessageSquare } from 'lucide-react';

import type { Token, Step  } from '../types/types';


const LLMVisualization: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>("The quick brown fox");
  const [tokens, setTokens] = useState<string[]>([]);
  const [embeddings, setEmbeddings] = useState<Token[]>([]);
  const [attentionWeights, setAttentionWeights] = useState<number[][]>([]);
  const [output, setOutput] = useState<string>("");

  const steps: Step[] = [
    { name: "Input Text", icon: MessageSquare, description: "Raw text input" },
    { name: "Tokenization", icon: Zap, description: "Breaking text into tokens" },
    { name: "Embeddings", icon: Brain, description: "Converting tokens to vectors" },
    { name: "Attention", icon: Eye, description: "Computing attention weights" },
    { name: "Generation", icon: ChevronRight, description: "Generating output" }
  ];

  const tokenizeText = (text: string): string[] => {
    return text.toLowerCase().split(/\s+/).filter(word => word.length > 0);
  };

  const generateEmbeddings = (tokenList: string[]): Token[] => {
    return tokenList.map(token => ({
      token,
      vector: Array.from({ length: 8 }, () => Math.random() * 2 - 1)
    }));
  };

  const generateAttentionWeights = (tokenList: string[]): number[][] => {
    const weights: number[][] = [];
    for (let i = 0; i < tokenList.length; i++) {
      const row: number[] = [];
      for (let j = 0; j < tokenList.length; j++) {
        row.push(Math.random());
      }
      const sum = row.reduce((a, b) => a + b, 0);
      weights.push(row.map(w => w / sum));
    }
    return weights;
  };

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setIsPlaying(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentStep, isPlaying, steps.length]);

  useEffect(() => {
    const tokenList = tokenizeText(inputText);
    
    if (currentStep >= 1) {
      setTokens(tokenList);
    }
    if (currentStep >= 2) {
      setEmbeddings(generateEmbeddings(tokenList));
    }
    if (currentStep >= 3) {
      setAttentionWeights(generateAttentionWeights(tokenList));
    }
    if (currentStep >= 4) {
      setOutput("jumps over the lazy dog");
    }
  }, [currentStep, inputText]);

  const handlePlay = (): void => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = (): void => {
    setCurrentStep(0);
    setIsPlaying(false);
    setTokens([]);
    setEmbeddings([]);
    setAttentionWeights([]);
    setOutput("");
  };

  const handleStepClick = (stepIndex: number): void => {
    setCurrentStep(stepIndex);
    setIsPlaying(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setInputText(e.target.value);
  };

  const TokenVisualization: React.FC = () => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
        <Zap className="mr-2 text-blue-500" size={20} />
        Tokenization
      </h3>
      <div className="flex flex-wrap gap-3">
        {tokens.map((token, i) => (
          <div
            key={i}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-500 transform hover:scale-105 ${
              currentStep >= 1 
                ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-md animate-pulse' 
                : 'bg-gray-200 text-gray-500'
            }`}
            style={{ 
              animationDelay: `${i * 200}ms`,
              animationDuration: '2s'
            }}
          >
            {token}
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-600 mt-4 bg-gray-50 p-3 rounded-lg">
        💡 Each word becomes a token that the model can process
      </p>
    </div>
  );

  const EmbeddingVisualization: React.FC = () => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
        <Brain className="mr-2 text-purple-500" size={20} />
        Embeddings
      </h3>
      <div className="space-y-4">
        {embeddings.map((emb, i) => (
          <div key={i} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-20 text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
              {emb.token}
            </div>
            <div className="flex space-x-1">
              {emb.vector.map((val, j) => (
                <div
                  key={j}
                  className={`w-5 h-5 rounded-md transition-all duration-1000 shadow-sm hover:shadow-md ${
                    currentStep >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                  }`}
                  style={{
                    backgroundColor: val > 0 
                      ? `rgba(59, 130, 246, ${Math.abs(val)})` 
                      : `rgba(239, 68, 68, ${Math.abs(val)})`,
                    animationDelay: `${(i * 100) + (j * 50)}ms`
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-600 mt-4 bg-gray-50 p-3 rounded-lg">
        🔢 Each token is converted to a high-dimensional vector representation
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
        <table className="w-full">
          <thead>
            <tr>
              <th className="w-16 p-2"></th>
              {tokens.map((token, i) => (
                <th key={i} className="px-3 py-2 text-xs font-bold text-gray-700 bg-gray-100 rounded-t-lg">
                  {token}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {attentionWeights.map((row, i) => (
              <tr key={i}>
                <td className="px-3 py-2 text-xs font-bold text-gray-700 bg-gray-100 rounded-l-lg">
                  {tokens[i]}
                </td>
                {row.map((weight, j) => (
                  <td key={j} className="px-1 py-1">
                    <div
                      className={`w-10 h-10 rounded-lg transition-all duration-1000 border-2 border-white shadow-sm hover:shadow-md ${
                        currentStep >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                      }`}
                      style={{
                        backgroundColor: `rgba(34, 197, 94, ${weight})`,
                        animationDelay: `${(i * 100) + (j * 50)}ms`
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-gray-600 mt-4 bg-gray-50 p-3 rounded-lg">
        👁️ Attention weights show how much each token "pays attention" to others
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 p-4">
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
            <div className="flex items-center space-x-3">
              <label htmlFor="input-text" className="text-sm font-bold text-gray-700">
                Input Text:
              </label>
              <input
                id="input-text"
                type="text"
                value={inputText}
                onChange={handleInputChange}
                className="px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 shadow-sm"
                placeholder="Enter text to process..."
              />
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 lg:gap-4">
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
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
              <MessageSquare className="mr-2 text-blue-500" size={20} />
              Input Text
            </h3>
            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border-2 border-gray-200">
              <p className="text-lg font-mono text-gray-800">{inputText}</p>
            </div>
            <p className="text-sm text-gray-600 mt-4 bg-gray-50 p-3 rounded-lg">
              📝 The raw text that will be processed by the language model
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
                {output}
              </p>
            </div>
            <p className="text-sm text-gray-600 mt-4 bg-gray-50 p-3 rounded-lg">
              🎯 The model's predicted continuation of the input text
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
                Text is broken down into smaller units (tokens) that the model can process. 
                This could be words, subwords, or characters depending on the tokenizer.
              </p>
            </div>
            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200 hover:shadow-lg transition-shadow duration-300">
              <h4 className="font-bold text-purple-900 mb-3 text-lg">🧠 Embeddings</h4>
              <p className="text-sm text-purple-800 leading-relaxed">
                Each token is converted into a high-dimensional vector that captures 
                semantic meaning and relationships between words in the vocabulary.
              </p>
            </div>
            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200 hover:shadow-lg transition-shadow duration-300">
              <h4 className="font-bold text-green-900 mb-3 text-lg">👁️ Attention</h4>
              <p className="text-sm text-green-800 leading-relaxed">
                The model learns which tokens are most relevant to each other, 
                allowing it to understand context and long-range dependencies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LLMVisualization;