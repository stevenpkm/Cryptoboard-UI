
import React from 'react';
import { Watchlist } from '../types';
import { LayoutDashboard, List, Plus, Settings, Trash2, Edit3, Loader2 } from 'lucide-react';

interface SidebarProps {
  watchlists: Watchlist[];
  activeId: string | 'dashboard' | 'settings';
  onNavigate: (id: string) => void;
  onCreateWatchlist: () => void;
  onDeleteWatchlist: (id: string) => void;
  onRenameWatchlist: (id: string) => void;
  isLoading: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  watchlists, activeId, onNavigate, onCreateWatchlist, onDeleteWatchlist, onRenameWatchlist, isLoading 
}) => {
  return (
    <div className="w-64 h-full bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0 select-none">
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xl tracking-tight">
          <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span>CRYPTO<span className="text-zinc-500">v1</span></span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        <div className="space-y-1">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeId === 'dashboard' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
        </div>

        <div className="space-y-1">
          <div className="px-3 flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Your Watchlists</span>
            <button 
              onClick={(e) => { e.stopPropagation(); onCreateWatchlist(); }}
              className="p-1 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-emerald-400 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          {isLoading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="w-4 h-4 text-zinc-600 animate-spin" />
            </div>
          ) : (
            watchlists.map(list => (
              <div 
                key={list.id} 
                className={`group flex items-center rounded-lg transition-all pr-1.5 ${
                  activeId === list.id ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                }`}
              >
                <button
                  onClick={() => onNavigate(list.id)}
                  className="flex-1 text-left flex items-center gap-3 px-3 py-2 text-sm font-medium truncate"
                >
                  <List className="w-4 h-4 shrink-0" />
                  <span className="truncate">{list.name}</span>
                </button>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                   <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRenameWatchlist(list.id); }}
                    className="p-1.5 hover:bg-zinc-700 rounded-md hover:text-blue-400 transition-colors"
                    title="Rename"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDeleteWatchlist(list.id); }}
                    className="p-1.5 bg-zinc-700/30 hover:bg-rose-500/20 rounded-md text-zinc-500 hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/30"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="p-4 border-t border-zinc-800">
        <button
          onClick={() => onNavigate('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            activeId === 'settings' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
