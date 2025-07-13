'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Navigation } from '@/components/ui/navigation';
import { ServerCard } from '@/components/ui/server-card';
import { StatCard } from '@/components/ui/stat-card';
import { TruckersAPI } from '@/lib/api';
import { Server, Version } from '@/types/api';
import { Users, Server as ServerIcon, Activity, Clock, Search, Filter, AlertCircle, Package, Download, Truck, Layers } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/use-debounce';
import Footer from '@/components/footer';

// Types for better type safety
type GameFilter = 'all' | 'ets2' | 'ats';
type StatusFilter = 'all' | 'online' | 'offline' | 'event';

interface ServerStats {
  totalPlayers: number;
  onlineServers: number;
  eventServers: number;
  averageLoad: number;
}

// Custom hook for server data management
const useServers = () => {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [gameVersion, setGameVersion] = useState<Version>({
    name:"",
    numeric:"",
    stage:"",
    ets2mp_checksum:{
      dll:"",
      adb:""
    },
    atsmp_checksum:{
      dll:"",
      adb:""
    },
    time:"",
    supported_ats_game_version:"",
    supported_game_version:""
  })

  const fetchServers = useCallback(async () => {
    try {
      setError(null);
      const data = await TruckersAPI.getServers();
      const versionData = await TruckersAPI.getVersion();
      versionData && setGameVersion(versionData);
      setServers(data.response || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch servers:', error);
      setError('Unable to load server data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServers();
    
    // Update every 30 seconds
    const interval = setInterval(fetchServers, 30000);
    return () => clearInterval(interval);
  }, [fetchServers]);

  return { servers, loading, error,gameVersion, lastUpdated, refetch: fetchServers };
};

export default function ServersPage() {
  const { servers, loading, error, lastUpdated, refetch, gameVersion } = useServers();
  const [searchTerm, setSearchTerm] = useState('');
  const [gameFilter, setGameFilter] = useState<GameFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showFilters, setShowFilters] = useState(true);

  // Debounce search input for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Memoized filtered servers for performance
  const filteredServers = useMemo(() => {
    let filtered = servers;

    // Search filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(server => 
        server.name.toLowerCase().includes(searchLower) ||
        server.shortname.toLowerCase().includes(searchLower)
      );
    }

    // Game filter
    if (gameFilter !== 'all') {
      filtered = filtered.filter(server => server.game.toLowerCase() === gameFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      switch (statusFilter) {
        case 'online':
          filtered = filtered.filter(server => server.online);
          break;
        case 'offline':
          filtered = filtered.filter(server => !server.online);
          break;
        case 'event':
          filtered = filtered.filter(server => server.event || server.specialEvent);
          break;
      }
    }

    // Sort servers (online first, then by player count)
    return filtered.sort((a, b) => {
      if (a.online !== b.online) return b.online ? 1 : -1;
      return b.players - a.players;
    });
  }, [servers, debouncedSearchTerm, gameFilter, statusFilter]);

  // Calculate statistics
  const stats: ServerStats = useMemo(() => {
    const totalPlayers = servers.reduce((sum, server) => sum + server.players, 0);
    const onlineServers = servers.filter(server => server.online).length;
    const eventServers = servers.filter(server => server.event || server.specialEvent).length;
    const averageLoad = servers.length > 0 
      ? servers.reduce((sum, server) => sum + (server.players / server.maxplayers), 0) / servers.length * 100
      : 0;

    return { totalPlayers, onlineServers, eventServers, averageLoad };
  }, [servers]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setGameFilter('all');
    setStatusFilter('all');
  }, []);

  const hasActiveFilters = searchTerm || gameFilter !== 'all' || statusFilter !== 'all';

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="pt-24 pb-12 px-6">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="h-12 w-96 mx-auto mb-6" />
            <Skeleton className="h-6 w-[600px] mx-auto mb-12" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      <div className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-6">Server Status</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-4">
              Real-time monitoring of all TruckersMP servers. Find the perfect server for your trucking adventure.
            </p>
            {lastUpdated && (
              <p className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="mb-8 bg-red-950 border-red-900">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-white">
                {error}
                <Button
                  variant="link"
                  className="ml-2 text-red-400 hover:text-red-300"
                  onClick={refetch}
                >
                  Try again
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-4">
            <StatCard
              title="Total Players"
              value={stats.totalPlayers.toLocaleString()}
              subtitle="Across all servers"
              icon={Users}
            />
            <StatCard
              title="Online Servers"
              value={stats.onlineServers}
              subtitle={`${servers.length} total`}
              icon={ServerIcon}
            />
            <StatCard
              title="Event Servers"
              value={stats.eventServers}
              subtitle="Special events active"
              icon={Activity}
            />
            <StatCard
              title="Average Load"
              value={`${stats.averageLoad.toFixed(1)}%`}
              subtitle="Server capacity"
              icon={Clock}
            />
          </div>
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
            <StatCard
              title="Current Version"
              value={gameVersion.name}
              subtitle="Build Version"
              icon={Package} // more version specific
            />

            <StatCard
              title="Stage"
              value={gameVersion.stage}
              subtitle="Current Stage"
              icon={Layers} // represents launcher / downloading
            />

            <StatCard
              title="ETS2 Supported Version"
              value={gameVersion.supported_game_version}
              subtitle="ETS2 compatible version"
              icon={Truck} // Euro Truck
            />

            <StatCard
              title="ATS Supported Version"
              value={gameVersion.supported_ats_game_version}
              subtitle="ATS compatible version"
              icon={Truck} // or a different truck icon variant
            />

          </div>

          {/* Filters Section */}
          <div className="bg-zinc-900 rounded-xl p-6 border-2 border-white/10 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </h2>
              <div className="flex gap-2">
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="text-gray-400"
                  >
                    Reset filters
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-gray-400 md:hidden"
                >
                  {showFilters ? 'Hide' : 'Show'}
                </Button>
              </div>
            </div>
            
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="search" className="block text-sm font-medium text-gray-300 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="search"
                      placeholder="Search servers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-black border-white/10 text-white pl-9"
                      aria-label="Search servers"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="game-filter" className="block text-sm font-medium text-gray-300 mb-2">
                    Game
                  </label>
                  <select
                    id="game-filter"
                    value={gameFilter}
                    onChange={(e) => setGameFilter(e.target.value as GameFilter)}
                    className="w-full px-3 py-2 bg-black border-2 border-white/10 rounded-lg text-white focus:border-red-500 focus:outline-none transition-colors"
                    aria-label="Filter by game"
                  >
                    <option value="all">All Games</option>
                    <option value="ets2">Euro Truck Simulator 2</option>
                    <option value="ats">American Truck Simulator</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="status-filter" className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                    className="w-full px-3 py-2 bg-black border-2 border-white/10 rounded-lg text-white focus:border-red-500 focus:outline-none transition-colors"
                    aria-label="Filter by status"
                  >
                    <option value="all">All Status</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="event">Event Servers</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <Badge variant="secondary" className="w-full justify-center py-2 mb-1">
                    {filteredServers.length} of {servers.length} servers
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Servers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredServers.map((server) => (
              <ServerCard key={server.id} server={server} />
            ))}
          </div>

          {/* Empty State */}
          {filteredServers.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-900 rounded-full mb-6">
                <ServerIcon className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No servers found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search filters or check back later</p>
              <Button
                onClick={resetFilters}
                variant="outline"
                className="border-white/10 hover:text-white hover:bg-white/10"
              >
                Reset all filters
              </Button>
            </div>
          )}
        </div>
      </div>
      <Footer/>
    </div>
  );
}