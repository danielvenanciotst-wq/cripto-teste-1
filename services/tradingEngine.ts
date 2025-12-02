
import { BotConfig, MarketPair, Position, PositionSide, StrategyType, Log, TradeHistory } from '../types';

/**
 * This service simulates the behavior that would typically happen on a Node.js backend.
 * It mocks API connectivity, strategy calculation, and order execution.
 */

export class TradingEngine {
  private marketData: MarketPair[] = [];
  private positions: Position[] = [];
  private history: TradeHistory[] = [];
  private balance: number = 0;
  private config: BotConfig;

  constructor(initialMarket: MarketPair[], initialBalance: number, config: BotConfig) {
    this.marketData = initialMarket;
    this.balance = initialBalance;
    this.config = config;
  }

  // Update configuration dynamically
  updateConfig(newConfig: BotConfig) {
    this.config = newConfig;
  }

  // Inject real market data from API
  setMarketData(newData: MarketPair[]) {
    // Preserve RSI simulation while updating prices
    this.marketData = newData.map(newPair => {
      const oldPair = this.marketData.find(p => p.symbol === newPair.symbol);
      
      // If we have old data, simulate RSI movement based on price change
      // In a real app, you would calculate RSI based on candles
      let rsi = oldPair ? oldPair.rsi : 50;
      if (oldPair) {
         const change = (newPair.price - oldPair.price) / oldPair.price;
         rsi += change * 100; // Simplified RSI reaction
         rsi = Math.max(10, Math.min(90, rsi));
      }

      return {
        ...newPair,
        rsi
      };
    });
  }

  // Simulate a price tick (websocket update)
  tick(): { market: MarketPair[], positions: Position[], balance: number, logs: Log[], history: TradeHistory[] } {
    const newLogs: Log[] = [];

    // 1. Update Positions P&L based on current market data
    this.positions = this.positions.map(pos => {
      const currentPrice = this.marketData.find(m => m.symbol === pos.symbol)?.price || pos.currentPrice;
      const priceDiffRatio = (currentPrice - pos.entryPrice) / pos.entryPrice;
      
      // Calculate PnL based on side and leverage
      let rawPnlPercent = pos.side === PositionSide.LONG ? priceDiffRatio : -priceDiffRatio;
      const pnlPercent = rawPnlPercent * pos.leverage;
      const pnl = (pos.amount * pnlPercent);

      return {
        ...pos,
        currentPrice,
        pnl,
        pnlPercent: pnlPercent * 100
      };
    });

    // 2. Strategy Execution (Only if Running)
    if (this.config.isRunning) {
      this.executeStrategy(newLogs);
    }

    return {
      market: this.marketData,
      positions: this.positions,
      balance: this.balance,
      logs: newLogs,
      history: this.history
    };
  }

  private executeStrategy(logs: Log[]) {
    // Check Max Positions
    if (this.positions.length >= this.config.maxPositions) return;

    // Iterate pairs and look for signals
    this.marketData.forEach(pair => {
      // Don't trade if already in position
      if (this.positions.find(p => p.symbol === pair.symbol)) return;

      const signal = this.analyze(pair, logs);
      
      if (signal) {
        this.openPosition(pair, signal, logs);
      }
    });

    // Check stop losses / take profits
    const activePositions: Position[] = [];
    
    this.positions.forEach(pos => {
      let closeReason = '';
      
      if (pos.pnlPercent <= -5) { // Stop Loss at -5%
        closeReason = 'Stop Loss (Ponto X invalidado)';
      } else if (pos.pnlPercent >= 12) { // Take Profit at +12%
        closeReason = 'Alvo Harmônico Atingido';
      }

      if (closeReason) {
        // Close Position
        this.balance += (pos.amount + pos.pnl);
        
        const historyItem: TradeHistory = {
          id: pos.id,
          symbol: pos.symbol,
          side: pos.side,
          entryPrice: pos.entryPrice,
          exitPrice: pos.currentPrice,
          pnl: pos.pnl,
          timestamp: Date.now()
        };
        this.history.unshift(historyItem); // Add to history

        logs.push({
          timestamp: Date.now(),
          type: pos.pnl > 0 ? 'SUCCESS' : 'WARNING',
          message: `${closeReason}: ${pos.symbol} (${pos.pnl > 0 ? '+' : ''}${pos.pnl.toFixed(2)} USDT)`
        });
      } else {
        activePositions.push(pos);
      }
    });

    this.positions = activePositions;
  }

  private analyze(pair: MarketPair, logs: Log[]): PositionSide | null {
    const strategy = this.config.strategy;
    const r = Math.random();
    
    // Chance to find a pattern per tick
    // Adjusted probability since we are fetching real data less frequently
    const patternThreshold = 0.98; 

    if (r > patternThreshold) {
      const isBullish = Math.random() > 0.5;
      const side = isBullish ? PositionSide.LONG : PositionSide.SHORT;
      const directionStr = isBullish ? 'Bullish' : 'Bearish';

      if (strategy === StrategyType.HARMONIC_GARTLEY) {
        logs.push({
          timestamp: Date.now(),
          type: 'INFO',
          message: `TradingView Scanner: Padrão Gartley ${directionStr} validado em ${pair.symbol}. Retração B=0.618.`
        });
        return side;
      } 
      else if (strategy === StrategyType.HARMONIC_BUTTERFLY) {
        logs.push({
          timestamp: Date.now(),
          type: 'INFO',
          message: `TradingView Scanner: Butterfly ${directionStr} detectado em ${pair.symbol}. Extensão D=1.27.`
        });
        return side;
      } 
      else if (strategy === StrategyType.HARMONIC_BAT) {
        logs.push({
          timestamp: Date.now(),
          type: 'INFO',
          message: `TradingView Scanner: Padrão Bat ${directionStr} (Morcego) em ${pair.symbol}. Reversão em 0.886.`
        });
        return side;
      }
    }
    
    return null;
  }

  private openPosition(pair: MarketPair, side: PositionSide, logs: Log[]) {
    const margin = (this.balance * this.config.tradeAmountPercent) / 100;
    
    if (margin < 5) return; // Minimum trade size check

    const newPosition: Position = {
      id: Math.random().toString(36).substr(2, 9),
      symbol: pair.symbol,
      side,
      entryPrice: pair.price,
      currentPrice: pair.price,
      amount: margin,
      leverage: this.config.leverage,
      pnl: 0,
      pnlPercent: 0,
      timestamp: Date.now()
    };

    this.positions.push(newPosition);
    this.balance -= margin; // Deduct margin from available balance
    
    logs.push({
      timestamp: Date.now(),
      type: 'SUCCESS',
      message: `Entrada Harmônica: ${side} em ${pair.symbol} @ $${pair.price.toFixed(4)}`
    });
  }

  // Emergency Panic Button
  closeAllPositions(): Log {
    let totalPnL = 0;
    this.positions.forEach(p => {
      totalPnL += p.pnl;
      this.balance += (p.amount + p.pnl);
      
      // Add to history
      this.history.unshift({
        id: p.id,
        symbol: p.symbol,
        side: p.side,
        entryPrice: p.entryPrice,
        exitPrice: p.currentPrice,
        pnl: p.pnl,
        timestamp: Date.now()
      });
    });
    
    const count = this.positions.length;
    this.positions = [];
    
    return {
      timestamp: Date.now(),
      type: 'WARNING',
      message: `PARADA DE EMERGÊNCIA: ${count} posições fechadas. PnL Total: ${totalPnL.toFixed(2)}`
    };
  }
}
