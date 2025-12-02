import { MarketPair } from './types';

export const TOP_30_PAIRS: string[] = [
  'BTC_USDT', 'ETH_USDT', 'SOL_USDT', 'XRP_USDT', 'ADA_USDT',
  'DOGE_USDT', 'AVAX_USDT', 'DOT_USDT', 'TRX_USDT', 'MATIC_USDT',
  'LTC_USDT', 'SHIB_USDT', 'LINK_USDT', 'BCH_USDT', 'ATOM_USDT',
  'UNI_USDT', 'LEO_USDT', 'ETC_USDT', 'XMR_USDT', 'XLM_USDT',
  'ICP_USDT', 'FIL_USDT', 'HBAR_USDT', 'APT_USDT', 'VET_USDT',
  'NEAR_USDT', 'QNT_USDT', 'AAVE_USDT', 'ALGO_USDT', 'EGLD_USDT'
];

// Helper to get realistic base price
const getBasePrice = (symbol: string): number => {
  if (symbol.includes('BTC')) return 96500;
  if (symbol.includes('ETH')) return 3650;
  if (symbol.includes('SOL')) return 240;
  if (symbol.includes('XRP')) return 2.50;
  if (symbol.includes('ADA')) return 1.10;
  if (symbol.includes('DOGE')) return 0.42;
  if (symbol.includes('AVAX')) return 45;
  if (symbol.includes('DOT')) return 8.50;
  if (symbol.includes('TRX')) return 0.25;
  if (symbol.includes('LTC')) return 110;
  if (symbol.includes('LINK')) return 18;
  if (symbol.includes('BCH')) return 450;
  if (symbol.includes('SHIB')) return 0.000025;
  return 10 + Math.random() * 50; // Generic altcoin price
};

// Initial mock data generation with realistic prices
export const INITIAL_MARKET_DATA: MarketPair[] = TOP_30_PAIRS.map(symbol => {
  const basePrice = getBasePrice(symbol);
  return {
    symbol,
    price: basePrice * (0.98 + Math.random() * 0.04), // Variation +/- 2%
    change24h: (Math.random() * 15) - 7.5,
    volume24h: Math.random() * 100000000,
    rsi: 30 + Math.random() * 40
  };
});

export const STRATEGY_DESCRIPTIONS = {
  HARMONIC_GARTLEY: "O clássico padrão 'M' ou 'W'. A IA busca retração de 61.8% na perna B e reversão precisa no ponto D (78.6% de XA). Ideal para mercados laterais.",
  HARMONIC_BUTTERFLY: "Padrão de extensão de tendência. Busca reversões em novos máximos/mínimos com ponto D estendido a 127% ou 161.8% da perna XA.",
  HARMONIC_BAT: "Padrão Morcego. Identifica retrações profundas onde o ponto B toca 38.2% ou 50% de XA, buscando entradas sniper em 88.6% da retração."
};