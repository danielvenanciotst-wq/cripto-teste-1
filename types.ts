
export enum StrategyType {
  HARMONIC_GARTLEY = 'HARMONIC_GARTLEY',
  HARMONIC_BUTTERFLY = 'HARMONIC_BUTTERFLY',
  HARMONIC_BAT = 'HARMONIC_BAT'
}

export enum PositionSide {
  LONG = 'LONG',
  SHORT = 'SHORT'
}

export interface MarketPair {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  rsi: number; // Simulated indicator
}

export interface Position {
  id: string;
  symbol: string;
  side: PositionSide;
  entryPrice: number;
  currentPrice: number;
  amount: number; // In USDT
  leverage: number;
  pnl: number;
  pnlPercent: number;
  timestamp: number;
}

export interface TradeHistory {
  id: string;
  symbol: string;
  side: PositionSide;
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  timestamp: number;
}

export interface BotConfig {
  apiKey: string;
  apiSecret: string;
  passphrase?: string;
  strategy: StrategyType;
  tradeAmountPercent: number; // % of balance per trade
  leverage: number;
  maxPositions: number;
  isRunning: boolean;
  isSimulation: boolean;
}

export interface User {
  email: string;
  name: string;
  balance: number;
}

export interface Log {
  timestamp: number;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
}
