import React from 'react';
import { BotConfig, StrategyType } from '../types';
import { STRATEGY_DESCRIPTIONS } from '../constants';
import { Network, Triangle, Hexagon } from 'lucide-react';

interface StrategyConfigProps {
  config: BotConfig;
  onUpdate: (newConfig: Partial<BotConfig>) => void;
}

export const StrategyConfig: React.FC<StrategyConfigProps> = ({ config, onUpdate }) => {
  
  const strategies = [
    {
      id: StrategyType.HARMONIC_GARTLEY,
      name: 'Padrão Gartley',
      icon: Network,
      color: 'text-blue-500',
      desc: STRATEGY_DESCRIPTIONS.HARMONIC_GARTLEY
    },
    {
      id: StrategyType.HARMONIC_BUTTERFLY,
      name: 'Padrão Butterfly',
      icon: Triangle,
      color: 'text-purple-500',
      desc: STRATEGY_DESCRIPTIONS.HARMONIC_BUTTERFLY
    },
    {
      id: StrategyType.HARMONIC_BAT,
      name: 'Padrão Morcego (Bat)',
      icon: Hexagon,
      color: 'text-orange-500',
      desc: STRATEGY_DESCRIPTIONS.HARMONIC_BAT
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Configuração de Padrões Harmônicos</h2>
        <p className="text-gray-400">A IA analisará a geometria do mercado baseada em Fibonacci (TradingView Data Feed).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {strategies.map((strat) => (
          <button
            key={strat.id}
            onClick={() => onUpdate({ strategy: strat.id })}
            className={`relative p-6 rounded-2xl border text-left transition-all duration-300 hover:-translate-y-1 ${
              config.strategy === strat.id
                ? 'bg-dark-800 border-gate-500 shadow-lg shadow-gate-500/10 ring-1 ring-gate-500'
                : 'bg-dark-800 border-dark-600 hover:border-dark-500'
            }`}
          >
            {config.strategy === strat.id && (
              <div className="absolute top-4 right-4 w-3 h-3 bg-gate-500 rounded-full shadow-[0_0_10px_rgba(217,67,67,0.8)]" />
            )}
            <strat.icon className={`w-8 h-8 mb-4 ${strat.color}`} />
            <h3 className="text-lg font-bold text-white mb-2">{strat.name}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{strat.desc}</p>
          </button>
        ))}
      </div>

      <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6 md:p-8">
        <h3 className="text-lg font-bold text-white mb-6">Gerenciamento de Risco</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Valor por Trade (% do Saldo)
            </label>
            <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="1" max="50" 
                  value={config.tradeAmountPercent}
                  onChange={(e) => onUpdate({ tradeAmountPercent: parseInt(e.target.value) })}
                  className="flex-1 h-2 bg-dark-600 rounded-lg appearance-none cursor-pointer accent-gate-500"
                />
                <span className="w-16 text-right font-mono text-xl text-white font-bold">{config.tradeAmountPercent}%</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Recomendado: 2-5% para harmônicos.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Alavancagem (Cruzada)
            </label>
            <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="1" max="25" step="1"
                  value={config.leverage}
                  onChange={(e) => onUpdate({ leverage: parseInt(e.target.value) })}
                  className="flex-1 h-2 bg-dark-600 rounded-lg appearance-none cursor-pointer accent-gate-500"
                />
                <span className="w-16 text-right font-mono text-xl text-white font-bold">{config.leverage}x</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Atenção: Padrões podem falhar. Use SL.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Máx. Posições Simultâneas
            </label>
            <div className="flex items-center gap-4">
                <div className="flex gap-2">
                    {[1, 3, 5, 10].map(num => (
                        <button
                            key={num}
                            onClick={() => onUpdate({ maxPositions: num })}
                            className={`w-10 h-10 rounded-lg font-bold transition-colors ${
                                config.maxPositions === num 
                                ? 'bg-gate-500 text-white' 
                                : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                            }`}
                        >
                            {num}
                        </button>
                    ))}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};