
import React, { useState, useEffect, useRef } from 'react';
import { Layout } from './components/Layout';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { StrategyConfig } from './components/StrategyConfig';
import { Settings } from './components/Settings';
import { BotConfig, StrategyType, MarketPair, Position, Log, TradeHistory } from './types';
import { INITIAL_MARKET_DATA, TOP_30_PAIRS } from './constants';
import { TradingEngine } from './services/tradingEngine';

// Default initial state
const DEFAULT_CONFIG: BotConfig = {
  apiKey: '',
  apiSecret: '',
  strategy: StrategyType.HARMONIC_GARTLEY,
  tradeAmountPercent: 5,
  leverage: 5,
  maxPositions: 5,
  isRunning: false,
  isSimulation: true
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // App State
  const [config, setConfig] = useState<BotConfig>(DEFAULT_CONFIG);
  const [marketData, setMarketData] = useState<MarketPair[]>(INITIAL_MARKET_DATA);
  const [positions, setPositions] = useState<Position[]>([]);
  const [history, setHistory] = useState<TradeHistory[]>([]);
  const [balance, setBalance] = useState(10000); // Default 10k USDT
  const [logs, setLogs] = useState<Log[]>([]);
  
  // Connection Status State
  const [apiStatus, setApiStatus] = useState<'connected' | 'error' | 'connecting'>('connecting');

  // Engine Ref (persists across renders)
  const engineRef = useRef<TradingEngine | null>(null);

  // Initialize Engine
  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = new TradingEngine(INITIAL_MARKET_DATA, 10000, config);
    }
  }, []);

  // Fetch Real Gate.io Spot Prices
  const fetchGateIoPrices = async () => {
    try {
        const response = await fetch('https://api.gateio.ws/api/v4/spot/tickers');
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        
        // Filter only pairs we are interested in (from constants)
        // Gate.io format: currency_pair: "BTC_USDT", last: "96000.00", etc.
        const relevantPairs = data.filter((item: any) => TOP_30_PAIRS.includes(item.currency_pair));
        
        const mappedPairs: MarketPair[] = relevantPairs.map((item: any) => ({
            symbol: item.currency_pair,
            price: parseFloat(item.last),
            change24h: parseFloat(item.change_percentage),
            volume24h: parseFloat(item.base_volume),
            rsi: 50 // Placeholder, updated by engine simulation logic
        }));

        if (engineRef.current && mappedPairs.length > 0) {
            engineRef.current.setMarketData(mappedPairs);
            setApiStatus('connected');
        }
    } catch (error) {
        console.error("Erro ao buscar preços Gate.io (provável CORS ou erro de rede):", error);
        setApiStatus('error');
    }
  };

  // Poll API for prices
  useEffect(() => {
    fetchGateIoPrices(); // Initial fetch
    const priceInterval = setInterval(fetchGateIoPrices, 5000); // Fetch every 5 seconds
    return () => clearInterval(priceInterval);
  }, []);

  // Main Loop (Engine Tick)
  useEffect(() => {
    const interval = setInterval(() => {
      if (engineRef.current) {
        // Sync engine config
        engineRef.current.updateConfig(config);
        
        // Tick
        const state = engineRef.current.tick();
        
        // Update React State
        setMarketData(state.market);
        setPositions(state.positions);
        setHistory(state.history);
        setBalance(state.balance);
        if (state.logs.length > 0) {
          setLogs(prev => [...prev, ...state.logs].slice(-50)); // Keep last 50 logs
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [config]);

  const handleLogin = (email: string) => {
    setUserEmail(email);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserEmail('');
    setConfig({ ...config, isRunning: false });
  };

  const updateConfig = (newSettings: Partial<BotConfig>) => {
    setConfig(prev => ({ ...prev, ...newSettings }));
  };

  const toggleBot = () => {
    const isStarting = !config.isRunning;
    updateConfig({ isRunning: isStarting });
    setLogs(prev => [...prev, {
      timestamp: Date.now(),
      type: isStarting ? 'SUCCESS' : 'WARNING',
      message: isStarting ? 'Motor do Robô INICIADO.' : 'Motor do Robô PARADO.'
    }]);
  };

  const panicStop = () => {
    updateConfig({ isRunning: false });
    if (engineRef.current) {
      const log = engineRef.current.closeAllPositions();
      setLogs(prev => [...prev, log]);
    }
  };

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      onLogout={handleLogout}
      userEmail={userEmail}
    >
      {activeTab === 'dashboard' && (
        <Dashboard 
          balance={balance}
          positions={positions}
          marketData={marketData}
          config={config}
          onToggleBot={toggleBot}
          onPanic={panicStop}
          logs={logs}
        />
      )}
      
      {activeTab === 'strategies' && (
        <StrategyConfig config={config} onUpdate={updateConfig} />
      )}

      {activeTab === 'settings' && (
        <Settings config={config} onUpdateConfig={updateConfig} />
      )}

      {activeTab === 'live-monitor' && (
         <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Monitoramento Ao Vivo</h2>
                
                {apiStatus === 'connected' && (
                  <div className="flex items-center gap-2 text-xs bg-dark-700 px-3 py-1 rounded-full text-blue-400 border border-blue-500/20">
                     <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                     Gate.io Spot API (Feed Real)
                  </div>
                )}
                
                {apiStatus === 'error' && (
                  <div className="flex items-center gap-2 text-xs bg-red-900/20 px-3 py-1 rounded-full text-red-400 border border-red-500/20" title="O navegador pode estar bloqueando a conexão direta (CORS). Dados simulados em uso.">
                     <div className="w-2 h-2 rounded-full bg-red-500"></div>
                     API Error (Dados Fallback)
                  </div>
                )}

                {apiStatus === 'connecting' && (
                  <div className="flex items-center gap-2 text-xs bg-dark-700 px-3 py-1 rounded-full text-yellow-400 border border-yellow-500/20">
                     <div className="w-2 h-2 rounded-full bg-yellow-500 animate-bounce"></div>
                     Conectando...
                  </div>
                )}
            </div>

            {/* Active Positions Section */}
            <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Posições Abertas
                </h3>
                {positions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 bg-dark-900 rounded-xl border border-dashed border-dark-600">
                    Nenhuma posição ativa. Ligue o robô no Dashboard.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="text-gray-500 text-xs uppercase bg-dark-700">
                        <tr>
                           <th className="p-3">Símbolo</th>
                           <th className="p-3">Lado</th>
                           <th className="p-3 text-right">Tamanho</th>
                           <th className="p-3 text-right">Entrada</th>
                           <th className="p-3 text-right">Atual (Spot)</th>
                           <th className="p-3 text-right">PnL (USDT)</th>
                           <th className="p-3 text-right">ROE %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dark-600">
                        {positions.map(pos => (
                          <tr key={pos.id} className="hover:bg-dark-700/50">
                             <td className="p-3 font-medium text-white">{pos.symbol} <span className="text-xs text-gray-500 bg-dark-600 px-1 rounded">{pos.leverage}x</span></td>
                             <td className={`p-3 font-bold ${pos.side === 'LONG' ? 'text-green-500' : 'text-red-500'}`}>{pos.side}</td>
                             <td className="p-3 text-right text-gray-300">{pos.amount.toFixed(2)}</td>
                             <td className="p-3 text-right text-gray-400">{pos.entryPrice.toFixed(4)}</td>
                             <td className="p-3 text-right text-white">{pos.currentPrice.toFixed(4)}</td>
                             <td className={`p-3 text-right font-medium ${pos.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                               {pos.pnl > 0 ? '+' : ''}{pos.pnl.toFixed(2)}
                             </td>
                             <td className={`p-3 text-right font-medium ${pos.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                               {pos.pnlPercent > 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%
                             </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>

            {/* Trade History Section */}
            <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                    <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                    Histórico de Trades Concluídos
                </h3>
                {history.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 bg-dark-900 rounded-xl border border-dashed border-dark-600">
                    Nenhum trade finalizado ainda.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="text-gray-500 text-xs uppercase bg-dark-700">
                        <tr>
                           <th className="p-3">Data/Hora</th>
                           <th className="p-3">Símbolo</th>
                           <th className="p-3">Lado</th>
                           <th className="p-3 text-right">Entrada</th>
                           <th className="p-3 text-right">Saída (Spot)</th>
                           <th className="p-3 text-right">P&L (USDT)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dark-600">
                        {history.map(trade => (
                          <tr key={trade.id} className="hover:bg-dark-700/50">
                             <td className="p-3 text-gray-400 text-sm font-mono">
                                {new Date(trade.timestamp).toLocaleString('pt-BR')}
                             </td>
                             <td className="p-3 font-medium text-white">{trade.symbol}</td>
                             <td className={`p-3 font-bold ${trade.side === 'LONG' ? 'text-green-500' : 'text-red-500'}`}>{trade.side}</td>
                             <td className="p-3 text-right text-gray-400">{trade.entryPrice.toFixed(4)}</td>
                             <td className="p-3 text-right text-white">{trade.exitPrice.toFixed(4)}</td>
                             <td className={`p-3 text-right font-medium ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                               {trade.pnl > 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                             </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
         </div>
      )}
    </Layout>
  );
};

export default App;
