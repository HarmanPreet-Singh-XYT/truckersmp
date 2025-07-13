'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Navigation } from '@/components/ui/navigation';
import { VTCCard } from '@/components/ui/vtc-card';
import { StatCard } from '@/components/ui/stat-card';
import { TruckersAPI } from '@/lib/api';
import { APICompanyIndex, APICompanySimple } from '@/types/web';
import { Users, Shield, Globe, TrendingUp, AlertCircle, Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { debounce } from 'lodash';
import Footer from '@/components/footer';

// Types
interface VTCData {
  recent: APICompanySimple[];
  featured: APICompanySimple[];
  featured_cover: APICompanySimple[];
}

interface VTCStats {
  totalMembers: number;
  verifiedCount: number;
  recruitingCount: number;
  averageMembers: number;
}

interface FilterState {
  search: string;
  game: 'all' | 'ets2' | 'ats';
  status: 'all' | 'verified' | 'recruiting';
}

// Custom Hooks
const useVTCData = () => {
  const [vtcs, setVTCs] = useState<VTCData>({ 
    recent: [], 
    featured: [], 
    featured_cover: [] 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVTCs = async () => {
      try {
        setError(null);
        setLoading(true);
        
        const data = await TruckersAPI.getVTCs();
        
        if (!data?.response) {
          throw new Error('Invalid response structure');
        }
        
        setVTCs({
          recent: data.response.recent || [],
          featured: data.response.featured || [],
          featured_cover: data.response.featured_cover || []
        });
      } catch (err) {
        console.error('Failed to fetch VTCs:', err);
        setError(err instanceof Error ? err.message : 'Failed to load VTCs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchVTCs();
  }, []);

  return { vtcs, loading, error };
};

// Utility Functions
const calculateStats = (vtcs: APICompanySimple[]): VTCStats => {
  const totalMembers = vtcs.reduce((sum, vtc) => sum + (vtc.members_count || 0), 0);
  const verifiedCount = vtcs.filter(vtc => vtc.verified).length;
  const recruitingCount = vtcs.filter(vtc => vtc.recruitment === 'Open').length;
  const averageMembers = vtcs.length > 0 ? Math.round(totalMembers / vtcs.length) : 0;

  return { totalMembers, verifiedCount, recruitingCount, averageMembers };
};

const filterVTCs = (vtcs: APICompanySimple[], filters: FilterState): APICompanySimple[] => {
  return vtcs.filter(vtc => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        vtc.name?.toLowerCase().includes(searchLower) ||
        vtc.tag?.toLowerCase().includes(searchLower) ||
        (vtc.slogan?.toLowerCase().includes(searchLower) ?? false);
      
      if (!matchesSearch) return false;
    }

    // Game filter
    if (filters.game !== 'all') {
      if (filters.game === 'ets2' && !vtc.games?.ets) return false;
      if (filters.game === 'ats' && !vtc.games?.ats) return false;
    }

    // Status filter
    if (filters.status === 'verified' && !vtc.verified) return false;
    if (filters.status === 'recruiting' && vtc.recruitment !== 'Open') return false;

    return true;
  });
};

// Components
const LoadingState = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="h-16 w-16 animate-spin text-red-500 mx-auto mb-4" />
      <div className="text-white text-xl">Loading VTCs...</div>
    </div>
  </div>
);

const ErrorState = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="min-h-screen bg-black">
    <Navigation />
    <div className="pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <Alert variant="destructive" className="bg-red-900/20 border-red-500">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="text-center mt-8">
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  </div>
);

const EmptyState = ({ hasFilters }: { hasFilters: boolean }) => (
  <div className="text-center py-12">
    <div className="text-gray-400 text-xl">
      {hasFilters ? 'No VTCs match your filters' : 'No VTCs found'}
    </div>
    {hasFilters && (
      <p className="text-gray-500 mt-2">Try adjusting your search criteria</p>
    )}
  </div>
);

const VTCFilters = ({ 
  filters, 
  onFiltersChange,
  totalCount,
  filteredCount 
}: { 
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  totalCount: number;
  filteredCount: number;
}) => {
  const handleSearchChange = useCallback(
    debounce((value: string) => {
      onFiltersChange({ ...filters, search: value });
    }, 300),
    [filters, onFiltersChange]
  );

  return (
    <div className="bg-zinc-900 rounded-xl p-6 border-2 border-white/10 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-300 mb-2">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Search VTCs..."
              defaultValue={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="bg-black border-white/10 text-white pl-10"
              aria-label="Search VTCs"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="game-filter" className="block text-sm font-medium text-gray-300 mb-2">
            Game
          </label>
          <Select 
            value={filters.game} 
            onValueChange={(value) => onFiltersChange({ ...filters, game: value as FilterState['game'] })}
          >
            <SelectTrigger id="game-filter" className="bg-black border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10">
              <SelectItem value="all">All Games</SelectItem>
              <SelectItem value="ets2">Euro Truck Simulator 2</SelectItem>
              <SelectItem value="ats">American Truck Simulator</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-300 mb-2">
            Status
          </label>
          <Select 
            value={filters.status} 
            onValueChange={(value) => onFiltersChange({ ...filters, status: value as FilterState['status'] })}
          >
            <SelectTrigger id="status-filter" className="bg-black border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="verified">Verified Only</SelectItem>
              <SelectItem value="recruiting">Recruiting</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-end">
          <div className="text-sm text-gray-400">
            <span className="font-semibold text-white">{filteredCount}</span> of {totalCount} VTCs shown
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function VTCsPage() {
  const { vtcs, loading, error } = useVTCData();
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    game: 'all',
    status: 'all'
  });
  const [activeTab, setActiveTab] = useState('featured');

  // Memoized calculations
  const allVTCs = useMemo(() => {
    const vtcMap = new Map<number, APICompanySimple>();
    [...vtcs.featured, ...vtcs.recent, ...vtcs.featured_cover].forEach(vtc => {
      vtcMap.set(vtc.id, vtc);
    });
    return Array.from(vtcMap.values());
  }, [vtcs]);

  const stats = useMemo(() => calculateStats(allVTCs), [allVTCs]);

  const filteredVTCs = useMemo(() => ({
    featured: filterVTCs(vtcs.featured, filters),
    recent: filterVTCs(vtcs.recent, filters),
    featured_cover: filterVTCs(vtcs.featured_cover, filters)
  }), [vtcs, filters]);

  const hasActiveFilters = filters.search !== '' || filters.game !== 'all' || filters.status !== 'all';

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      <main className="pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-6">
              Virtual Trucking Companies
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover and join established VTCs, or find inspiration to create your own trucking company.
            </p>
          </header>

          {/* Stats Overview */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12" aria-label="VTC Statistics">
            <StatCard
              title="Total Members"
              value={stats.totalMembers}
              subtitle="Across all VTCs"
              icon={Users}
            />
            <StatCard
              title="Verified VTCs"
              value={stats.verifiedCount}
              subtitle={`${allVTCs.length} total unique VTCs`}
              icon={Shield}
            />
            <StatCard
              title="Recruiting"
              value={stats.recruitingCount}
              subtitle="Accepting members"
              icon={Globe}
            />
            <StatCard
              title="Avg. Members"
              value={stats.averageMembers}
              subtitle="Per VTC"
              icon={TrendingUp}
            />
          </section>

          {/* Filters */}
          <VTCFilters
            filters={filters}
            onFiltersChange={setFilters}
            totalCount={allVTCs.length}
            filteredCount={filterVTCs(allVTCs, filters).length}
          />

          {/* VTCs Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-zinc-900">
              <TabsTrigger value="featured" className="data-[state=active]:bg-red-500">
                Featured ({filteredVTCs.featured.length})
              </TabsTrigger>
              <TabsTrigger value="recent" className="data-[state=active]:bg-red-500">
                Recent ({filteredVTCs.recent.length})
              </TabsTrigger>
              <TabsTrigger value="cover" className="data-[state=active]:bg-red-500">
                Cover Featured ({filteredVTCs.featured_cover.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="featured">
              {filteredVTCs.featured.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredVTCs.featured.map((vtc) => (
                    <VTCCard key={`featured-${vtc.id}`} vtc={vtc} variant="featured" />
                  ))}
                </div>
              ) : (
                <EmptyState hasFilters={hasActiveFilters} />
              )}
            </TabsContent>

            <TabsContent value="recent">
              {filteredVTCs.recent.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredVTCs.recent.map((vtc) => (
                    <VTCCard key={`recent-${vtc.id}`} vtc={vtc} />
                  ))}
                </div>
              ) : (
                <EmptyState hasFilters={hasActiveFilters} />
              )}
            </TabsContent>

            <TabsContent value="cover">
              {filteredVTCs.featured_cover.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredVTCs.featured_cover.map((vtc) => (
                    <VTCCard key={`cover-${vtc.id}`} vtc={vtc} variant="featured" />
                  ))}
                </div>
              ) : (
                <EmptyState hasFilters={hasActiveFilters} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer/>
    </div>
  );
}