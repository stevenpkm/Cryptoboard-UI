
export interface Coin {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change1h: number;
  change12h: number;
  change24h: number;
  change7d: number;
  volume24h: number;
  marketCap: number;
  rank: number;
  categories: string[];
}

export interface Watchlist {
  id: string;
  name: string;
  coinIds: string[];
  notesByCoinId: Record<string, string>;
}

export type SortDirection = 'asc' | 'desc';
export type SortKey = keyof Coin;

export interface CategoryTrend {
  category: string;
  trendScore: number;
  coinCount: number;
  topCoins: Coin[];
}

export interface RefreshConfig {
  id: string;
  name: string;
  source: string;
  enabled: boolean;
  interval: string;
  recommended: string;
  allowedIntervals: string[];
  lastUpdated: string;
}

export interface AppSettings {
  refreshConfigs: RefreshConfig[];
}
