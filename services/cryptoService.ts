
import { Coin, Watchlist, RefreshConfig } from '../types';
import { generateMockCoins, INITIAL_WATCHLISTS } from '../mockData';

class CryptoService {
  private coins: Coin[] = generateMockCoins(200);
  private watchlists: Watchlist[] = [...INITIAL_WATCHLISTS];
  private refreshConfigs: RefreshConfig[] = [
    { id: 'price', name: 'Price Data', source: 'Binance', enabled: true, interval: '10s', recommended: '10s', allowedIntervals: ['5s', '10s', '30s'], lastUpdated: new Date().toISOString() },
    { id: 'change', name: 'Percentage Change Data', source: 'Binance', enabled: true, interval: '60s', recommended: '60s', allowedIntervals: ['30s', '60s', '120s'], lastUpdated: new Date().toISOString() },
    { id: 'volume', name: 'Volume Data', source: 'Binance', enabled: true, interval: '60s', recommended: '60s', allowedIntervals: ['30s', '60s', '120s'], lastUpdated: new Date().toISOString() },
    { id: 'mcap', name: 'Market Cap Data', source: 'CoinGecko', enabled: true, interval: '5m', recommended: '5m', allowedIntervals: ['1m', '3m', '5m', '10m'], lastUpdated: new Date(Date.now() - 300000).toISOString() },
    { id: 'categories', name: 'Coin Category / Narrative Data', source: 'CoinGecko', enabled: true, interval: '12h', recommended: '12h', allowedIntervals: ['1h', '6h', '12h', '24h'], lastUpdated: new Date(Date.now() - 3600000).toISOString() },
  ];

  async getAllCoins(): Promise<Coin[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...this.coins];
  }

  async getTop200Movers(): Promise<Coin[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return [...this.coins]
      .sort((a, b) => b.change24h - a.change24h)
      .slice(0, 200);
  }

  async getWatchlists(): Promise<Watchlist[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.watchlists.map(w => ({ ...w }));
  }

  async updateWatchlist(id: string, updates: Partial<Watchlist>): Promise<Watchlist> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = this.watchlists.findIndex(w => w.id === id);
    if (index === -1) throw new Error('Watchlist not found');
    
    this.watchlists[index] = { ...this.watchlists[index], ...updates };
    return { ...this.watchlists[index] };
  }

  async createWatchlist(name: string): Promise<Watchlist> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newList: Watchlist = {
      id: `watchlist-${Date.now()}`,
      name,
      coinIds: [],
      notesByCoinId: {},
    };
    this.watchlists.push(newList);
    return { ...newList };
  }

  async deleteWatchlist(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    this.watchlists = this.watchlists.filter(w => w.id !== id);
  }

  async findCoinsByQuery(query: string): Promise<string[]> {
    const tokens = query.split(/[\s,]+/).map(t => t.toLowerCase().trim()).filter(Boolean);
    const foundIds: string[] = [];
    for (const token of tokens) {
      const match = this.coins.find(c => 
        c.symbol.toLowerCase() === token || 
        c.name.toLowerCase() === token
      );
      if (match) foundIds.push(match.id);
    }
    return [...new Set(foundIds)];
  }

  // Settings Methods
  async getRefreshConfigs(): Promise<RefreshConfig[]> {
    return [...this.refreshConfigs];
  }

  async updateRefreshConfig(id: string, updates: Partial<RefreshConfig>): Promise<RefreshConfig[]> {
    this.refreshConfigs = this.refreshConfigs.map(config => {
      if (config.id === id) {
        const updated = { ...config, ...updates };
        return updated;
      }
      return config;
    });

    // Business Logic Rule: Disabling Price Data must automatically disable Percentage Change and Volume
    if (id === 'price' && updates.enabled === false) {
      this.refreshConfigs = this.refreshConfigs.map(config => {
        if (config.id === 'change' || config.id === 'volume') {
          return { ...config, enabled: false };
        }
        return config;
      });
    }

    return [...this.refreshConfigs];
  }
}

export const cryptoService = new CryptoService();
