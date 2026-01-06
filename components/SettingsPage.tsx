
import React from 'react';
import { RefreshConfig } from '../types';
import { cryptoService } from '../services/cryptoService';
import { Activity, Database, Clock, ShieldCheck, ToggleLeft, ToggleRight, Info } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const [configs, setConfigs] = React.useState<RefreshConfig[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      const data = await cryptoService.getRefreshConfigs();
      setConfigs(data);
      setIsLoading(false);
    };
    load();
  }, []);

  const handleToggle = async (id: string, currentState: boolean) => {
    const updated = await cryptoService.updateRefreshConfig(id, { enabled: !currentState });
    setConfigs(updated);
  };

  const handleIntervalChange = async (id: string, interval: string) => {
    const updated = await cryptoService.updateRefreshConfig(id, { interval });
    setConfigs(updated);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-2">
          <Database className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-bold text-zinc-100">Data Refresh Configuration</h2>
        </div>
        <p className="text-zinc-500 text-sm">
          Adjust the refresh frequency for various data streams. Lower intervals consume more API bandwidth.
        </p>
      </div>

      <div className="grid gap-4">
        {configs.map((config) => (
          <div 
            key={config.id} 
            className={`bg-zinc-900/30 border rounded-2xl p-6 transition-all duration-300 ${
              config.enabled ? 'border-zinc-800' : 'border-zinc-800/50 opacity-60 bg-zinc-950/20'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-zinc-100">{config.name}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                    {config.source}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Last updated: {new Date(config.lastUpdated).toLocaleTimeString()}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-500/80">
                    <ShieldCheck className="w-3 h-3" />
                    Recommended: {config.recommended}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end gap-2">
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Interval</span>
                  <div className="flex bg-zinc-950/50 border border-zinc-800 p-1 rounded-xl">
                    {config.allowedIntervals.map((interval) => (
                      <button
                        key={interval}
                        disabled={!config.enabled}
                        onClick={() => handleIntervalChange(config.id, interval)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          config.interval === interval 
                            ? 'bg-emerald-500 text-zinc-950 shadow-lg' 
                            : 'text-zinc-500 hover:text-zinc-300 disabled:cursor-not-allowed'
                        }`}
                      >
                        {interval}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-10 w-px bg-zinc-800 hidden md:block" />

                <button 
                  onClick={() => handleToggle(config.id, config.enabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                    config.enabled ? 'bg-emerald-500' : 'bg-zinc-700'
                  }`}
                >
                  <span className="sr-only">Toggle Refresh</span>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      config.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
            {!config.enabled && config.id === 'price' && (
              <div className="mt-4 flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-[11px] font-medium">
                <Info className="w-4 h-4" />
                Disabling Price Data also disables Percentage Change and Volume tracking as they depend on price feeds.
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 bg-zinc-900/20 border border-zinc-800/50 rounded-2xl flex items-start gap-4">
        <Activity className="w-5 h-5 text-zinc-600 shrink-0 mt-0.5" />
        <div className="text-xs text-zinc-500 leading-relaxed">
          <p className="font-semibold text-zinc-400 mb-1">Performance Note</p>
          Settings are applied to the background worker immediately. Changes persist locally and will be synchronized with your account when online. Disabling a data group stops all corresponding fetch requests to save bandwidth and system resources.
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
