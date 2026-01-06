
import { Coin, Watchlist } from './types';
import { NARRATIVES } from './constants';

const getRandomChange = () => (Math.random() * 20 - 10);
const getRandomCategories = () => {
  const count = Math.floor(Math.random() * 2) + 1;
  const shuffled = [...NARRATIVES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const generateMockCoins = (count: number = 200): Coin[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `coin-${i + 1}`,
    name: `Asset ${i + 1}`,
    symbol: `TICKER${i + 1}`,
    rank: i + 1,
    price: Math.random() * 50000,
    change1h: getRandomChange() / 5,
    change12h: getRandomChange() / 2,
    change24h: getRandomChange(),
    change7d: getRandomChange() * 2,
    volume24h: Math.random() * 1000000000,
    marketCap: Math.random() * 500000000000,
    categories: getRandomCategories(),
  }));
};

export const INITIAL_WATCHLISTS: Watchlist[] = [
  {
    id: 'watchlist-1',
    name: 'Top Favorites',
    coinIds: ['coin-1', 'coin-2', 'coin-3'],
    notesByCoinId: { 'coin-1': 'Great entry point' },
  }
];
