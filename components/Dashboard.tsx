import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Wallet, PlayCircle, StopCircle, AlertOctagon } from 'lucide-react';
import { BotConfig, MarketPair, Position, Log } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  balance: number;
  positions: Position[];
  marketData: MarketPair[];
  config: BotConfig;
  onToggleBot: () => void;
  onPanic: () => void;
  logs: Log[];
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  balance, positions, marketData, config, onToggleBot, onPanic, logs 
}) => {
  
  const totalPnL = positions.reduce((acc, pos) => acc + pos.pnl, 0);
  const activePositions = positions.length;

  // Generate simple chart data
  const chartData = React.useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      time: i,
      val: balance + (Math.random() * 100 - 50) + totalPnL
    }));
  }, [balance, totalPnL]);

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-dark-800 p-5 rounded-2xl border border-dark-600 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet size={40} /></div>
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Saldo Total</p>
            <h3 className="text-2xl font-bold text-white flex items-center">
                <DollarSign className="w-5 h-5 text-gray-400" />
                {balance.toFixed(2)}
            </h3>
            <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +2.4% Hoje
            </div>
        </div>

        <div className="bg-dark-800 p-5 rounded-2xl border border-dark-600">
             <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">P&L Não Realizado</p>
             <h3 className={`text-2xl font-bold flex items-center ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)} <span className="text-sm ml-1 text-gray-500">USDT</span>
            </h3>
        </div>

        <div className="bg-dark-800 p-5 rounded-2xl border border-dark-600">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Posições Ativas</p>
            <h3 className="text-2xl font-bold text-white">{activePositions} <span className="text-sm text-gray-500 font-normal">/ {config.maxPositions}</span></h3>
        </div>

        <div className="bg-dark-800 p-5 rounded-2xl border border-dark-600 flex flex-col justify-between">
            <div className="flex items-center justify-between">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Status do Robô</p>
                <span className={`w-2 h-2 rounded-full ${config.isRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            </div>
            <button 
                onClick={onToggleBot}
                className={`w-full mt-2 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                    config.isRunning 
                    ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
            >
                {config.isRunning ? <><StopCircle size={18} /> Parar Robô</> : <><PlayCircle size={18} /> Iniciar Robô</>}
            </button>
        </div>
      </div>

      {/* Main Grid: Chart + Market List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Balance Chart & Logs */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-dark-800 rounded-2xl border border-dark-600 p-6 h-[300px]">
                <h3 className="text-lg font-semibold text-white mb-4">Performance do Portfólio</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#D94343" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#D94343" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="time" hide />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1E2329', border: 'none', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="val" stroke="#D94343" fillOpacity={1} fill="url(#colorVal)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Panic Button */}
            {activePositions > 0 && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertOctagon className="text-red-500 w-8 h-8" />
                        <div>
                            <h4 className="text-red-500 font-bold">Parada de Emergência</h4>
                            <p className="text-red-300/70 text-sm">Fechar imediatamente todas as posições e parar o robô.</p>
                        </div>
                    </div>
                    <button 
                        onClick={onPanic}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold transition-colors shadow-lg shadow-red-600/20"
                    >
                        PÂNICO / FECHAR TUDO
                    </button>
                </div>
            )}

            {/* Live Logs */}
            <div className="bg-dark-800 rounded-2xl border border-dark-600 flex flex-col h-[300px]">
                <div className="p-4 border-b border-dark-600">
                    <h3 className="text-sm font-semibold text-gray-300">Log de Atividades</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {logs.length === 0 && <p className="text-gray-600 text-center text-sm py-4">Nenhuma atividade. Inicie o robô.</p>}
                    {[...logs].reverse().map((log, i) => (
                        <div key={i} className="flex gap-3 text-sm">
                            <span className="text-gray-600 font-mono text-xs">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            <span className={`
                                ${log.type === 'SUCCESS' ? 'text-green-400' : ''}
                                ${log.type === 'ERROR' ? 'text-red-400' : ''}
                                ${log.type === 'WARNING' ? 'text-yellow-400' : ''}
                                ${log.type === 'INFO' ? 'text-gray-300' : ''}
                            `}>
                                {log.message}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Right Col: Market List */}
        <div className="bg-dark-800 rounded-2xl border border-dark-600 flex flex-col h-[600px] lg:h-auto">
            <div className="p-4 border-b border-dark-600 flex justify-between items-center">
                <h3 className="font-semibold text-white">Top 30 Mercados</h3>
                <span className="text-xs bg-dark-700 px-2 py-1 rounded text-gray-400">USDT-M</span>
            </div>
            <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left">
                    <thead className="text-xs text-gray-500 bg-dark-700 sticky top-0">
                        <tr>
                            <th className="p-3 font-medium">Par</th>
                            <th className="p-3 font-medium text-right">Preço</th>
                            <th className="p-3 font-medium text-right">24h</th>
                        </tr>
                    </thead>
                    <tbody>
                        {marketData.map(pair => (
                            <tr key={pair.symbol} className="border-b border-dark-700 hover:bg-dark-700/50 transition-colors">
                                <td className="p-3">
                                    <div className="font-medium text-gray-200">{pair.symbol.split('_')[0]}</div>
                                    <div className="text-[10px] text-gray-500">Vol {(pair.volume24h/1000000).toFixed(1)}M</div>
                                </td>
                                <td className="p-3 text-right font-mono text-gray-300">${pair.price.toFixed(pair.price < 1 ? 4 : 2)}</td>
                                <td className={`p-3 text-right font-medium ${pair.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {pair.change24h > 0 ? '+' : ''}{pair.change24h.toFixed(2)}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};