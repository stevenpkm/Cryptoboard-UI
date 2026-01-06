
import React from 'react';
import { CategoryTrend, Coin } from '../types';
import { NARRATIVES } from '../constants';

interface HeatmapProps {
  coins: Coin[];
  onCategoryClick: (category: string | null) => void;
  selectedCategory: string | null;
  mode: 'count' | 'trend';
}

const Heatmap: React.FC<HeatmapProps> = ({ coins, onCategoryClick, selectedCategory, mode }) => {
  const trends: CategoryTrend[] = React.useMemo(() => {
    return NARRATIVES.map(cat => {
      const catCoins = coins.filter(c => c.categories.includes(cat));
      const trendScore = catCoins.length > 0 
        ? catCoins.reduce((acc, c) => acc + Math.abs(c.change24h), 0) / catCoins.length
        : 0;
      
      return {
        category: cat,
        coinCount: catCoins.length,
        trendScore,
        topCoins: catCoins.sort((a, b) => b.change24h - a.change24h).slice(0, 3)
      };
    }).sort((a, b) => b.trendScore - a.trendScore);
  }, [coins]);

  const getHeatColor = (score: number) => {
    if (score > 8) return 'bg-emerald-900/50 border-emerald-500/50 text-emerald-400';
    if (score > 5) return 'bg-emerald-900/30 border-emerald-600/30 text-emerald-500';
    if (score > 3) return 'bg-zinc-800 border-zinc-700 text-zinc-400';
    return 'bg-zinc-900/50 border-zinc-800 text-zinc-500';
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
      {trends.map(t => (
        <button
          key={t.category}
          onClick={() => onCategoryClick(selectedCategory === t.category ? null : t.category)}
          className={`p-3 rounded-lg border text-left transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
            getHeatColor(t.trendScore)
          } ${selectedCategory === t.category ? 'ring-2 ring-emerald-400 border-emerald-400 shadow-lg shadow-emerald-900/20' : ''}`}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{t.category}</span>
            <span className="text-[10px] mono">
              {mode === 'count' ? `${t.coinCount} assets` : `+${t.trendScore.toFixed(1)}%`}
            </span>
          </div>
          <div className="flex -space-x-1.5 overflow-hidden">
            {t.topCoins.map((c, i) => (
              <div 
                key={c.id} 
                className="w-6 h-6 rounded-full bg-zinc-700 border border-zinc-900 flex items-center justify-center text-[8px] font-bold"
                title={c.symbol}
              >
                {c.symbol.charAt(0)}
              </div>
            ))}
            {t.coinCount > 3 && (
              <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-900 flex items-center justify-center text-[8px] text-zinc-400">
                +{t.coinCount - 3}
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

export default Heatmap;
