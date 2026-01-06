
import React from 'react';
import Sidebar from './components/Sidebar';
import CoinTable from './components/CoinTable';
import Heatmap from './components/Heatmap';
import SettingsPage from './components/SettingsPage';
import Modal from './components/Modal';
import { cryptoService } from './services/cryptoService';
import { Coin, Watchlist } from './types';
import { AlertCircle, Download, RefreshCw, Layers, List, Settings } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [coins, setCoins] = React.useState<Coin[]>([]);
  const [watchlists, setWatchlists] = React.useState<Watchlist[]>([]);
  const [activeView, setActiveView] = React.useState<string>('dashboard');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isActionLoading, setIsActionLoading] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [heatmapMode, setHeatmapMode] = React.useState<'count' | 'trend'>('trend');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = React.useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
  const [modalTargetId, setModalTargetId] = React.useState<string | null>(null);
  const [inputValue, setInputValue] = React.useState('');

  // Data Loading
  const fetchData = React.useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    
    try {
      const [allCoins, allWatchlists] = await Promise.all([
        cryptoService.getAllCoins(),
        cryptoService.getWatchlists()
      ]);
      setCoins(allCoins);
      setWatchlists(allWatchlists);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived Data
  const activeWatchlist = watchlists.find(w => w.id === activeView);
  const isSettings = activeView === 'settings';
  
  const displayCoins = React.useMemo(() => {
    if (isSettings) return [];
    let list = activeWatchlist 
      ? coins.filter(c => activeWatchlist.coinIds.includes(c.id))
      : coins.slice(0, 200);
    
    if (selectedCategory) {
      list = list.filter(c => c.categories.includes(selectedCategory));
    }
    return list;
  }, [coins, activeWatchlist, selectedCategory, isSettings]);

  // Actions
  const handleCreateWatchlist = async () => {
    if (!inputValue.trim() || isActionLoading) return;
    setIsActionLoading(true);
    try {
      const newList = await cryptoService.createWatchlist(inputValue);
      setWatchlists(prev => {
        if (prev.some(w => w.id === newList.id)) return prev;
        return [...prev, newList];
      });
      setActiveView(newList.id);
      setInputValue('');
      setIsCreateModalOpen(false);
    } catch (e) {
      console.error('Create failed', e);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRenameWatchlist = async () => {
    if (!inputValue.trim() || !modalTargetId || isActionLoading) return;
    setIsActionLoading(true);
    try {
      const updated = await cryptoService.updateWatchlist(modalTargetId, { name: inputValue });
      setWatchlists(prev => prev.map(w => w.id === modalTargetId ? updated : w));
      setInputValue('');
      setIsRenameModalOpen(false);
      setModalTargetId(null);
    } catch (e) {
      console.error('Rename failed', e);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteWatchlist = async (id: string) => {
    if (isActionLoading) return;
    const confirmed = window.confirm('Are you sure you want to delete this watchlist?');
    if (!confirmed) return;

    setIsActionLoading(true);
    try {
      await cryptoService.deleteWatchlist(id);
      setWatchlists(prev => prev.filter(w => w.id !== id));
      if (activeView === id) {
        setActiveView('dashboard');
      }
    } catch (e) {
      console.error('Delete failed', e);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleImportCoins = async () => {
    if (!modalTargetId || !inputValue.trim() || isActionLoading) return;
    setIsActionLoading(true);
    try {
      const foundIds = await cryptoService.findCoinsByQuery(inputValue);
      if (foundIds.length === 0) {
        alert('No coins found for those names/tickers.');
        return;
      }
      const list = watchlists.find(w => w.id === modalTargetId);
      if (list) {
        const updatedIds = [...new Set([...list.coinIds, ...foundIds])];
        const updated = await cryptoService.updateWatchlist(modalTargetId, { coinIds: updatedIds });
        setWatchlists(prev => prev.map(w => w.id === modalTargetId ? updated : w));
      }
      setInputValue('');
      setIsImportModalOpen(false);
    } catch (e) {
      console.error('Import failed', e);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUpdateNote = async (coinId: string, note: string) => {
    if (!activeWatchlist) return;
    const updatedNotes = { ...activeWatchlist.notesByCoinId, [coinId]: note };
    const updated = await cryptoService.updateWatchlist(activeWatchlist.id, { notesByCoinId: updatedNotes });
    setWatchlists(prev => prev.map(w => w.id === activeWatchlist.id ? updated : w));
  };

  const getPageTitle = () => {
    if (isSettings) return 'Application Settings';
    if (activeView === 'dashboard') return 'Top 200 Movers';
    return activeWatchlist?.name || 'Watchlist';
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0b] text-zinc-200 overflow-hidden">
      <Sidebar 
        watchlists={watchlists}
        activeId={activeView}
        onNavigate={setActiveView}
        isLoading={isLoading}
        onCreateWatchlist={() => { setInputValue(''); setIsCreateModalOpen(true); }}
        onDeleteWatchlist={handleDeleteWatchlist}
        onRenameWatchlist={(id) => {
          setModalTargetId(id);
          setInputValue(watchlists.find(w => w.id === id)?.name || '');
          setIsRenameModalOpen(true);
        }}
      />

      <main className="flex-1 overflow-y-auto relative custom-scrollbar">
        {/* Top Navigation / Header */}
        <header className="sticky top-0 z-30 bg-[#0a0a0b]/80 backdrop-blur-md border-b border-zinc-800 p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              {isSettings && <Settings className="w-6 h-6 text-zinc-500" />}
              {getPageTitle()}
              {activeView === 'dashboard' && <span className="text-zinc-600 text-sm font-normal">(24h)</span>}
            </h1>
            <p className="text-zinc-500 text-xs mt-1">
              {isSettings 
                ? 'Manage data synchronization and application preferences' 
                : activeView === 'dashboard' 
                  ? 'Real-time trending assets across all categories' 
                  : `${activeWatchlist?.coinIds.length || 0} assets tracked`}
            </p>
          </div>
          <div className="flex items-center gap-3">
             {!isSettings && (
               <button 
                onClick={() => fetchData(true)}
                disabled={isRefreshing || isActionLoading}
                className="p-2 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-400 transition-all flex items-center gap-2 text-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
             )}
            {activeWatchlist && (
               <button 
                onClick={() => { setModalTargetId(activeWatchlist.id); setInputValue(''); setIsImportModalOpen(true); }}
                disabled={isActionLoading}
                className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-semibold px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Import Coins
              </button>
            )}
          </div>
        </header>

        <div className="p-8 max-w-[1400px] mx-auto space-y-8">
          {isSettings ? (
            <SettingsPage />
          ) : (
            <>
              {/* Dashboard specific views */}
              {activeView === 'dashboard' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-emerald-400" />
                      <h2 className="text-lg font-semibold text-zinc-100">Narrative Heatmap</h2>
                    </div>
                    <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-1">
                      <button 
                        onClick={() => setHeatmapMode('trend')}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${heatmapMode === 'trend' ? 'bg-zinc-800 text-emerald-400 shadow' : 'text-zinc-500'}`}
                      >
                        Trend Score
                      </button>
                      <button 
                        onClick={() => setHeatmapMode('count')}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${heatmapMode === 'count' ? 'bg-zinc-800 text-emerald-400 shadow' : 'text-zinc-500'}`}
                      >
                        Asset Count
                      </button>
                    </div>
                  </div>
                  <Heatmap 
                    coins={coins} 
                    onCategoryClick={setSelectedCategory} 
                    selectedCategory={selectedCategory} 
                    mode={heatmapMode}
                  />
                </div>
              )}

              {/* Table Controls Info */}
              {selectedCategory && (
                <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-sm text-zinc-400">Filtering by category: </span>
                      <span className="text-sm font-bold text-emerald-400 uppercase tracking-wide">{selectedCategory}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    className="text-xs font-bold text-zinc-500 hover:text-zinc-300 uppercase tracking-wider"
                  >
                    Clear Filter
                  </button>
                </div>
              )}

              <CoinTable 
                coins={displayCoins} 
                isLoading={isLoading} 
                notesByCoinId={activeWatchlist?.notesByCoinId}
                onNoteUpdate={activeWatchlist ? handleUpdateNote : undefined}
              />

              {/* Empty State for Watchlists */}
              {activeWatchlist && activeWatchlist.coinIds.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-zinc-800 rounded-3xl text-center">
                  <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                    <List className="w-8 h-8 text-zinc-700" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-200 mb-2">No coins imported yet</h3>
                  <p className="text-zinc-500 max-sm mb-8">
                    Build your custom tracker by importing assets from the market. Use tickers like BTC, ETH, or names like Bitcoin.
                  </p>
                  <button 
                    onClick={() => { setModalTargetId(activeWatchlist.id); setInputValue(''); setIsImportModalOpen(true); }}
                    disabled={isActionLoading}
                    className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold px-8 py-3 rounded-xl transition-all shadow-xl shadow-emerald-500/10 active:scale-95 disabled:opacity-50"
                  >
                    Start Importing Assets
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Modals */}
      <Modal isOpen={isCreateModalOpen} onClose={() => !isActionLoading && setIsCreateModalOpen(false)} title="Create Watchlist">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Watchlist Name</label>
            <input 
              type="text"
              autoFocus
              value={inputValue}
              disabled={isActionLoading}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g. My Portfolio, AI Narrative..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-50"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateWatchlist()}
            />
          </div>
          <button 
            onClick={handleCreateWatchlist}
            disabled={isActionLoading}
            className="w-full bg-emerald-500 text-zinc-950 font-bold py-3 rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/10 disabled:opacity-50"
          >
            {isActionLoading ? 'Creating...' : 'Create List'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={isRenameModalOpen} onClose={() => !isActionLoading && setIsRenameModalOpen(false)} title="Rename Watchlist">
        <div className="space-y-4">
          <input 
            type="text"
            autoFocus
            value={inputValue}
            disabled={isActionLoading}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-50"
            onKeyDown={(e) => e.key === 'Enter' && handleRenameWatchlist()}
          />
          <button 
            onClick={handleRenameWatchlist}
            disabled={isActionLoading}
            className="w-full bg-emerald-500 text-zinc-950 font-bold py-3 rounded-xl hover:bg-emerald-400 transition-all disabled:opacity-50"
          >
            {isActionLoading ? 'Updating...' : 'Update Name'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={isImportModalOpen} onClose={() => !isActionLoading && setIsImportModalOpen(false)} title="Import Assets">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Paste tickers or names</label>
            <textarea 
              autoFocus
              rows={5}
              value={inputValue}
              disabled={isActionLoading}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="BTC, ETH, Solana, PEPE..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none disabled:opacity-50"
            />
            <p className="mt-2 text-[10px] text-zinc-500">Comma or newline separated list. We'll match them automatically.</p>
          </div>
          <button 
            onClick={handleImportCoins}
            disabled={isActionLoading}
            className="w-full bg-emerald-500 text-zinc-950 font-bold py-3 rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/10 disabled:opacity-50"
          >
            {isActionLoading ? 'Importing...' : 'Search & Import'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default App;
