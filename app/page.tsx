'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Navigation } from '@/components/ui/navigation';
import { StatCard } from '@/components/ui/stat-card';
import { ServerCard } from '@/components/ui/server-card';
import { EventCard } from '@/components/ui/event-card';
import { VTCCard } from '@/components/ui/vtc-card';
import { TruckersAPI } from '@/lib/api';
import { Server, Event, VTC, GameTime } from '@/types/api';
import { 
  Users, 
  Server as ServerIcon, 
  Calendar, 
  Clock, 
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { APICompanySimple } from '@/types/web';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '@/components/footer';

// Skeleton Loader Component
const SkeletonCard = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-zinc-800 rounded-xl p-6">
      <div className="h-4 bg-zinc-700 rounded w-3/4 mb-3"></div>
      <div className="h-8 bg-zinc-700 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-zinc-700 rounded w-2/3"></div>
    </div>
  </div>
);

// Error State Component
const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-12"
  >
    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
    <h3 className="text-xl font-semibold text-white mb-2">Something went wrong</h3>
    <p className="text-gray-400 mb-4">{message}</p>
    <button
      onClick={onRetry}
      className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
    >
      Try Again
    </button>
  </motion.div>
);

// Empty State Component
const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-12 text-gray-400">
    <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
    <p>{message}</p>
  </div>
);

export default function HomePage() {
  const [servers, setServers] = useState<Server[]>([]);
  const [events, setEvents] = useState<{
    featured: Event[];
    today: Event[];
    upcoming: Event[];
  }>({ featured: [], today: [], upcoming: [] });
  const [vtcs, setVTCs] = useState<{
    recent: APICompanySimple[];
    featured: APICompanySimple[];
    featured_cover: APICompanySimple[];
  }>({ recent: [], featured: [], featured_cover: [] });
  const [gameTime, setGameTime] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [serversData, eventsData, vtcsData, gameTimeData] = await Promise.all([
        TruckersAPI.getServers(),
        TruckersAPI.getEvents(),
        TruckersAPI.getVTCs(),
        TruckersAPI.getGameTime()
      ]);

      setServers(serversData.response || []);
      setEvents(eventsData.response || { featured: [], today: [], upcoming: [] });
      setVTCs(vtcsData.response || { recent: [], featured: [], featured_cover: [] });
      setGameTime(gameTimeData.game_time || 0);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load data. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshing(true);
      fetchData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchData]);

  // Increment game time every second
  useEffect(() => {
    if (!loading && gameTime > 0) {
      const interval = setInterval(() => {
        setGameTime(prev => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [loading, gameTime]);

  // Memoized calculations
  const stats = useMemo(() => {
    const totalPlayers = servers.reduce((sum, server) => sum + server.players, 0);
    const onlineServers = servers.filter(server => server.online).length;
    const totalVTCs = vtcs.featured.length + vtcs.recent.length + vtcs.featured_cover.length;
    const activeEvents = events.today.length;
    const serverUtilization = servers.length > 0 
      ? Math.round((servers.reduce((sum, server) => sum + (server.players / server.maxplayers), 0) / servers.length) * 100)
      : 0;

    return { totalPlayers, onlineServers, totalVTCs, activeEvents, serverUtilization };
  }, [servers, vtcs, events]);

  const formatGameTime = useCallback((timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="pt-24 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            {/* Loading skeleton */}
            <div className="animate-pulse text-center mb-12">
              <div className="h-12 bg-zinc-800 rounded-lg w-3/4 mx-auto mb-6"></div>
              <div className="h-6 bg-zinc-800 rounded-lg w-1/2 mx-auto"></div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {[...Array(4)].map((_, i) => (
                <SkeletonCard key={i} />
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
      
      {/* Refresh indicator */}
      <AnimatePresence>
        {refreshing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 bg-zinc-900 px-4 py-2 rounded-lg shadow-lg z-50"
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500 animate-pulse" />
              <span className="text-sm text-gray-300">Updating data...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-transparent" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto text-center relative z-10"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Welcome to <span className="text-red-500">TruckersMP</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            The ultimate multiplayer trucking experience. Join thousands of drivers, 
            participate in events, and build your virtual trucking company.
          </p>
          
          {/* Live Stats */}
          {error ? (
            <ErrorState message={error} onRetry={fetchData} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <StatCard
                  title="Players Online"
                  value={stats.totalPlayers.toLocaleString()}
                  subtitle={`${stats.serverUtilization}% server capacity`}
                  trend="up"
                  icon={Users}
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <StatCard
                  title="Active Servers"
                  value={stats.onlineServers}
                  subtitle={`${servers.length} total servers`}
                  icon={ServerIcon}
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <StatCard
                  title="Live Events"
                  value={stats.activeEvents}
                  subtitle={`${events.upcoming.length} upcoming`}
                  icon={Calendar}
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <StatCard
                  title="Game Time"
                  value={formatGameTime(gameTime)}
                  subtitle="In-game time"
                  icon={Clock}
                />
              </motion.div>
            </div>
          )}
        </motion.div>
      </section>

      {/* Featured Events */}
      {events.featured.length > 0 && (
        <section className="px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center justify-between mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white">Featured Events</h2>
              <Link 
                href="/events"
                className="text-red-500 hover:text-red-400 font-medium transition-colors flex items-center gap-2 group"
              >
                View All Events 
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {events.featured.slice(0, 3).map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <EventCard event={event} variant="featured" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular Servers */}
      <section className="py-20 px-6 bg-zinc-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white">Popular Servers</h2>
            <Link 
              href="/servers"
              className="text-red-500 hover:text-red-400 font-medium transition-colors flex items-center gap-2 group"
            >
              View All Servers
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {servers
              .sort((a, b) => b.players - a.players)
              .slice(0, 6)
              .map((server, index) => (
                <motion.div
                  key={server.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ServerCard server={server} />
                </motion.div>
              ))}
          </div>
        </div>
      </section>

      {/* Featured VTCs */}
      {vtcs.featured.length > 0 && (
        <section className="px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center justify-between mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white">Featured VTCs</h2>
              <Link 
                href="/vtcs"
                className="text-red-500 hover:text-red-400 font-medium transition-colors flex items-center gap-2 group"
              >
                Browse All VTCs
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {vtcs.featured.slice(0, 3).map((vtc, index) => (
                <motion.div
                  key={vtc.id}
                  initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <VTCCard vtc={vtc} variant="featured" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Current Events */}
      <section className="py-20 px-6 bg-zinc-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-white mb-12"
          >
            Happening Today
          </motion.h2>
          
          <div className="space-y-8">
            {events.today.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {events.today.slice(0, 6).map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <EventCard event={event} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <EmptyState message="No events scheduled for today. Check back tomorrow!" />
            )}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative py-24 px-6 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-600/10 rounded-full blur-2xl animate-pulse" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative max-w-4xl mx-auto"
        >
          <div className="relative group">
            {/* Animated border gradient */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-red-500 via-red-600 to-red-500 rounded-2xl opacity-75 group-hover:opacity-100 blur-sm transition duration-1000 group-hover:duration-200 animate-gradient-xy" />
            
            {/* Main content */}
            <div className="relative bg-zinc-900/90 backdrop-blur-xl rounded-2xl p-8 md:p-8 lg:p-12 border border-zinc-800">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm font-medium mb-6"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                Join 50,000+ Active Drivers
              </motion.div>

              {/* Heading */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-3xl text-center md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight"
              >
                Ready to Start Your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
                  Journey?
                </span>
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="text-lg text-center md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
              >
                Join the largest trucking community and experience the open road with thousands of other drivers worldwide.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <Link
                  href="/register"
                  className="group relative px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-red-500/25 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Create Account
                    <svg
                      className="w-4 h-4 transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </span>
                </Link>

                <Link
                  href="/download"
                  className="group relative px-8 py-4 bg-zinc-800 text-white rounded-xl font-medium transition-all duration-200 hover:bg-zinc-700 hover:shadow-lg hover:shadow-zinc-700/25 hover:-translate-y-0.5 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
                >
                  <span className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                      />
                    </svg>
                    Download Client
                  </span>
                </Link>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="mt-5 border-t border-zinc-800 flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500"
              >
                <div className="flex items-center gap-2 mt-6">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Free to Play
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  No Credit Card Required
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Cross-Platform
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer/>
    </div>
  );
}