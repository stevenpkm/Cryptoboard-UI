
import React from 'react';
import { Coin, SortDirection, SortKey } from '../types';
import { Search, ChevronUp, ChevronDown, Filter, FileText, LineChart } from 'lucide-react';

interface CoinTableProps {
  coins: Coin[];
  isLoading: boolean;
  notesByCoinId?: Record<string, string>;
  onNoteUpdate?: (coinId: string, note: string) => void;
}

const CoinTable: React.FC<CoinTableProps> = ({ coins, isLoading, notesByCoinId, onNoteUpdate }) => {
  const [search, setSearch] = React.useState('');
  const [sortKey, setSortKey] = React.useState<SortKey>('change24h');
  const [sortDir, setSortDir] = React.useState<SortDirection>('desc');
  const [filter, setFilter] = React.useState<'all' | 'gainers' | 'losers'>('all');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const filteredCoins = React.useMemo(() => {
    let result = coins.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.symbol.toLowerCase().includes(search.toLowerCase())
    );

    if (filter === 'gainers') result = result.filter(c => c.change24h > 0);
    if (filter === 'losers') result = result.filter(c => c.change24h < 0);

    return result.sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDir === 'asc' ? valA - valB : valB - valA;
      }
      return 0;
    });
  }, [coins, search, sortKey, sortDir, filter]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: val > 1 ? 2 : 6 }).format(val);

  const formatPercent = (val: number) => (
    <span className={val >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
      {val >= 0 ? '+' : ''}{val.toFixed(2)}%
    </span>
  );

  const formatLargeNumber = (val: number) => {
    if (val >= 1e12) return (val / 1e12).toFixed(2) + 'T';
    if (val >= 1e9) return (val / 1e9).toFixed(2) + 'B';
    if (val >= 1e6) return (val / 1e6).toFixed(2) + 'M';
    return val.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-zinc-800 rounded w-full"></div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-12 bg-zinc-900/50 rounded w-full"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden backdrop-blur-sm">
      <div className="p-4 border-b border-zinc-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'gainers', 'losers'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                filter === f ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="bg-zinc-900/50 text-zinc-500 border-b border-zinc-800">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Asset</th>
              <th className="px-4 py-3 font-medium cursor-pointer hover:text-zinc-300" onClick={() => handleSort('price')}>Price</th>
              <th className="px-4 py-3 font-medium cursor-pointer hover:text-zinc-300" onClick={() => handleSort('change1h')}>1h</th>
              <th className="px-4 py-3 font-medium cursor-pointer hover:text-zinc-300" onClick={() => handleSort('change24h')}>24h</th>
              <th className="px-4 py-3 font-medium cursor-pointer hover:text-zinc-300" onClick={() => handleSort('change7d')}>7d</th>
              <th className="px-4 py-3 font-medium cursor-pointer hover:text-zinc-300" onClick={() => handleSort('volume24h')}>24h Volume</th>
              <th className="px-4 py-3 font-medium cursor-pointer hover:text-zinc-300" onClick={() => handleSort('marketCap')}>Market Cap</th>
              {onNoteUpdate && <th className="px-4 py-3 font-medium">Notes</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filteredCoins.map((coin) => (
              <tr key={coin.id} className="hover:bg-zinc-800/40 transition-colors group">
                <td className="px-4 py-4 text-zinc-500 mono text-xs">{coin.rank}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-xs font-bold ring-1 ring-zinc-600">
                      {coin.symbol.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-zinc-100">{coin.name}</div>
                        <a 
                          href={`https://www.binance.com/en/trade/${coin.symbol}_USDT`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="View on Binance"
                        >
                          <LineChart className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <div className="text-[10px] text-zinc-500 flex gap-1">
                        <span className="bg-zinc-800 px-1 rounded uppercase">{coin.symbol}</span>
                        {coin.categories.slice(0, 1).map(cat => (
                           <span key={cat} className="text-zinc-600">· {cat}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 mono font-medium text-zinc-200">{formatCurrency(coin.price)}</td>
                <td className="px-4 py-4 mono">{formatPercent(coin.change1h)}</td>
                <td className="px-4 py-4 mono">{formatPercent(coin.change24h)}</td>
                <td className="px-4 py-4 mono">{formatPercent(coin.change7d)}</td>
                <td className="px-4 py-4 mono text-zinc-400">{formatLargeNumber(coin.volume24h)}</td>
                <td className="px-4 py-4 mono text-zinc-400">{formatLargeNumber(coin.marketCap)}</td>
                {onNoteUpdate && (
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 group/note">
                      <FileText className="w-3.5 h-3.5 text-zinc-600" />
                      <input 
                        type="text"
                        value={notesByCoinId?.[coin.id] || ''}
                        onChange={(e) => onNoteUpdate(coin.id, e.target.value)}
                        placeholder="Add note..."
                        className="bg-transparent border-none text-xs text-zinc-300 focus:outline-none focus:ring-0 placeholder:text-zinc-700 w-32 focus:w-48 transition-all"
                      />
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCoins.length === 0 && !isLoading && (
          <div className="p-12 text-center">
            <Filter className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
            <h3 className="text-zinc-400 font-medium mb-1">No results found</h3>
            <p className="text-zinc-600 text-sm">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoinTable;
