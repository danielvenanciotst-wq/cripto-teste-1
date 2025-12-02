import React, { useState } from 'react';
import { Key, Lock, CheckCircle2, AlertTriangle, RefreshCcw } from 'lucide-react';
import { BotConfig } from '../types';

interface SettingsProps {
  config: BotConfig;
  onUpdateConfig: (newConfig: Partial<BotConfig>) => void;
}

export const Settings: React.FC<SettingsProps> = ({ config, onUpdateConfig }) => {
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [apiSecret, setApiSecret] = useState(config.apiSecret);

  const handleTestConnection = () => {
    setTestStatus('testing');
    setTimeout(() => {
      if (apiKey.length > 5 && apiSecret.length > 5) {
        setTestStatus('success');
        onUpdateConfig({ apiKey, apiSecret });
      } else {
        setTestStatus('failed');
      }
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Key className="w-5 h-5 text-gate-500" />
          Conexão Gate.io
        </h2>

        <div className="space-y-4 max-w-2xl">
          <div className="p-4 bg-yellow-900/20 border border-yellow-700/30 rounded-lg flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
            <div className="text-sm text-yellow-200/80">
              <p className="font-semibold mb-1">Aviso de Segurança</p>
              Por favor, garanta que sua API Key tenha permissões de <strong>Futuros (Futures Trading)</strong> habilitadas. 
              <strong>NÃO</strong> habilite permissões de Saque (Withdrawal).
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-dark-900 border border-dark-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-gate-500/50 focus:border-gate-500 transition-all"
              placeholder="Insira sua Gate.io API Key"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Secret Key</label>
            <input
              type="password"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              className="w-full bg-dark-900 border border-dark-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-gate-500/50 focus:border-gate-500 transition-all"
              placeholder="Insira sua Gate.io Secret Key"
            />
          </div>

          <div className="pt-4 flex items-center gap-4">
            <button
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all ${
                testStatus === 'success' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gate-500 hover:bg-gate-600 text-white'
              }`}
            >
              {testStatus === 'testing' ? (
                <>
                  <RefreshCcw className="w-4 h-4 animate-spin" /> Testando...
                </>
              ) : testStatus === 'success' ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Conectado
                </>
              ) : (
                'Testar e Salvar Conexão'
              )}
            </button>
            
            {testStatus === 'failed' && (
              <span className="text-red-500 text-sm font-medium">Falha na conexão. Verifique suas chaves.</span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5 text-blue-500" />
          Modo Simulação (Paper Trading)
        </h2>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">Habilitar Modo Simulação</p>
            <p className="text-sm text-gray-400">Teste estratégias sem arriscar fundos reais usando USDT fictício.</p>
          </div>
          <button 
            onClick={() => onUpdateConfig({ isSimulation: !config.isSimulation })}
            className={`w-14 h-7 rounded-full p-1 transition-colors duration-200 ${
              config.isSimulation ? 'bg-blue-600' : 'bg-dark-600'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
              config.isSimulation ? 'translate-x-7' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>
    </div>
  );
};