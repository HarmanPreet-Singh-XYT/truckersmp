'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { Navigation } from '@/components/ui/navigation';
import { EventCard } from '@/components/ui/event-card';
import { StatCard } from '@/components/ui/stat-card';
import { TruckersAPI } from '@/lib/api';
import { Event } from '@/types/api';
import { 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp, 
  Search,
  RefreshCw,
  Filter,
  MapPin,
  AlertCircle,
  Truck
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Footer from '@/components/footer';

// Constants
const SORT_OPTIONS = {
  DATE_ASC: 'date-asc',
  DATE_DESC: 'date-desc',
  ATTENDEES: 'attendees',
  NAME: 'name'
} as const;

const TAB_OPTIONS = {
  FEATURED: 'featured',
  TODAY: 'today',
  UPCOMING: 'upcoming'
} as const;

type SortOption = typeof SORT_OPTIONS[keyof typeof SORT_OPTIONS];
type TabOption = typeof TAB_OPTIONS[keyof typeof TAB_OPTIONS];

// Skeleton Components
const EventCardSkeleton = () => (
  <div className="bg-zinc-900 rounded-lg p-6 animate-pulse">
    <div className="h-6 bg-zinc-800 rounded w-3/4 mb-4"></div>
    <div className="h-4 bg-zinc-800 rounded w-full mb-2"></div>
    <div className="h-4 bg-zinc-800 rounded w-2/3 mb-4"></div>
    <div className="flex justify-between">
      <div className="h-4 bg-zinc-800 rounded w-20"></div>
      <div className="h-4 bg-zinc-800 rounded w-24"></div>
    </div>
  </div>
);

const StatCardSkeleton = () => (
  <div className="bg-zinc-900 rounded-lg p-6 animate-pulse">
    <div className="h-8 bg-zinc-800 rounded w-16 mb-2"></div>
    <div className="h-6 bg-zinc-800 rounded w-24 mb-1"></div>
    <div className="h-4 bg-zinc-800 rounded w-20"></div>
  </div>
);

// Empty State Component
const EmptyState = ({ 
  title, 
  description, 
  icon: Icon 
}: { 
  title: string; 
  description: string; 
  icon: React.ElementType;
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-16"
  >
    <Icon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
    <div className="text-gray-400 text-xl mb-2">{title}</div>
    <p className="text-gray-500">{description}</p>
  </motion.div>
);

// Error State Component
const ErrorState = ({ 
  onRetry 
}: { 
  onRetry: () => void 
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-16"
  >
    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
    <div className="text-gray-400 text-xl mb-2">Failed to load events</div>
    <p className="text-gray-500 mb-4">Something went wrong. Please try again.</p>
    <Button onClick={onRetry} variant="outline" size="sm">
      <RefreshCw className="w-4 h-4 mr-2" />
      Retry
    </Button>
  </motion.div>
);

export default function EventsPage() {
  const [events, setEvents] = useState<{
    featured: Event[];
    today: Event[];
    // now: Event[];
    upcoming: Event[];
  }>({ featured: [], today: [], upcoming: [] });
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>(SORT_OPTIONS.DATE_ASC);
  const [activeTab, setActiveTab] = useState<TabOption>(TAB_OPTIONS.FEATURED);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch events function
  const fetchEvents = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      setError(false);
      const data = await TruckersAPI.getEvents();
      setEvents(data.response || { featured: [], today: [], upcoming: [] });
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Calculate stats
  const stats = useMemo(() => {
    const allEvents = [
      ...events.featured,
      ...events.today,
      // ...events.now,
      ...events.upcoming
    ];
    
    return {
      totalAttendees: allEvents.reduce((sum, event) => sum + parseInt(event.attendances.confirmed), 0),
      totalVTC: allEvents.reduce((sum, event) => sum + event.attendances.vtcs, 0),
      // activeEvents: events.now.length,
      todayEvents: events.today.length,
      upcomingEvents: events.upcoming.length
    };
  }, [events]);

  // Filter and sort events
  const filterAndSortEvents = useCallback((eventList: Event[]) => {
    let filtered = eventList;
    
    // Apply search filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = eventList.filter(event => 
        event.name.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.departure.city.toLowerCase().includes(searchLower) ||
        event.arrive.city.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case SORT_OPTIONS.DATE_ASC:
          return new Date(a.start_at).getTime() - new Date(b.start_at).getTime();
        case SORT_OPTIONS.DATE_DESC:
          return new Date(b.start_at).getTime() - new Date(a.start_at).getTime();
        case SORT_OPTIONS.ATTENDEES:
          return parseInt(b.attendances.confirmed) - parseInt(a.attendances.confirmed);
        case SORT_OPTIONS.NAME:
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
    
    return sorted;
  }, [debouncedSearchTerm, sortBy]);

  // Get current tab events
  const currentTabEvents = useMemo(() => {
    const eventMap = {
      [TAB_OPTIONS.FEATURED]: events.featured,
      [TAB_OPTIONS.TODAY]: events.today,
      [TAB_OPTIONS.UPCOMING]: events.upcoming
    };
    
    return filterAndSortEvents(eventMap[activeTab] || []);
  }, [events, activeTab, filterAndSortEvents]);

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="pt-24 pb-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div className="h-12 bg-zinc-800 rounded w-48 mx-auto mb-6 animate-pulse"></div>
              <div className="h-6 bg-zinc-800 rounded w-96 mx-auto animate-pulse"></div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {[1, 2, 3, 4].map((i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <EventCardSkeleton key={i} />
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
      
      <div className="pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold text-white mb-6">Events</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Join thousands of truckers in organized convoys, special events, and community gatherings.
            </p>
          </motion.div>

          {/* Stats Overview */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
          >
            <StatCard
              title="Total Attendees"
              value={stats.totalAttendees}
              subtitle="Across all events"
              icon={Users}
            />
            <StatCard
              title="Total VTC's"
              value={stats.totalVTC}
              subtitle="Across all events"
              icon={Truck}
            />
            <StatCard
              title="Today's Events"
              value={stats.todayEvents}
              subtitle="Events today"
              icon={Calendar}
            />
            <StatCard
              title="Upcoming"
              value={stats.upcomingEvents}
              subtitle="Future events"
              icon={TrendingUp}
            />
          </motion.div>

          {/* Controls */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row gap-4 mb-8"
          >
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-zinc-900 border-white/10 text-white focus:border-red-500 transition-colors"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-[180px] bg-zinc-900 border-white/10 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SORT_OPTIONS.DATE_ASC}>Date (Earliest)</SelectItem>
                  <SelectItem value={SORT_OPTIONS.DATE_DESC}>Date (Latest)</SelectItem>
                  <SelectItem value={SORT_OPTIONS.ATTENDEES}>Most Attendees</SelectItem>
                  <SelectItem value={SORT_OPTIONS.NAME}>Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                onClick={() => fetchEvents(true)} 
                disabled={refreshing}
                variant="outline"
                size="icon"
                className="border-white/10 hover:bg-zinc-900"
              >
                <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
              </Button>
            </div>
          </motion.div>

          {/* Events Tabs */}
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as TabOption)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-zinc-900/50 backdrop-blur">
              <TabsTrigger 
                value={TAB_OPTIONS.FEATURED} 
                className="data-[state=active]:bg-red-500 transition-all"
              >
                Featured ({events.featured.length})
              </TabsTrigger>
              {/* <TabsTrigger 
                value={TAB_OPTIONS.NOW} 
                className="data-[state=active]:bg-red-500 transition-all"
              >
                Live Now
              </TabsTrigger> */}
              <TabsTrigger 
                value={TAB_OPTIONS.TODAY} 
                className="data-[state=active]:bg-red-500 transition-all"
              >
                Today ({events.today.length})
              </TabsTrigger>
              <TabsTrigger 
                value={TAB_OPTIONS.UPCOMING} 
                className="data-[state=active]:bg-red-500 transition-all"
              >
                Upcoming ({events.upcoming.length})
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {error ? (
                  <ErrorState onRetry={() => fetchEvents()} />
                ) : currentTabEvents.length === 0 ? (
                                    <EmptyState
                    title={
                      debouncedSearchTerm
                        ? `No ${activeTab} events found matching "${debouncedSearchTerm}"`
                        : `No ${activeTab} events available`
                    }
                    description={
                      debouncedSearchTerm
                        ? "Try adjusting your search terms"
                        // : activeTab === TAB_OPTIONS.NOW
                        // ? "Check back soon for live events!"
                        : activeTab === TAB_OPTIONS.TODAY
                        ? "Check upcoming events for future activities!"
                        : "No events to display at this time"
                    }
                    icon={MapPin}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {currentTabEvents.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <EventCard 
                          event={event} 
                          variant={activeTab === TAB_OPTIONS.FEATURED ? "featured" : "default"} 
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </Tabs>

          {/* Results Summary */}
          {debouncedSearchTerm && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 text-center text-gray-400"
            >
              {currentTabEvents.length > 0 ? (
                <p>
                  Showing {currentTabEvents.length} {currentTabEvents.length === 1 ? 'event' : 'events'} 
                  {' '}matching {`"`}{debouncedSearchTerm}{`"`}
                </p>
              ) : null}
            </motion.div>
          )}
        </div>
      </div>
      <Footer/>
    </div>
  );
}