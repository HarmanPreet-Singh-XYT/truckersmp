'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Navigation } from '@/components/ui/navigation';
import { StatCard } from '@/components/ui/stat-card';
import { TruckersAPI } from '@/lib/api';
import { VTC, VTCNews } from '@/types/api';
import {
  Newspaper,
  Pin,
  Calendar,
  User,
  Building2,
  TrendingUp,
  Clock,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  SortAsc,
  SortDesc,
  Loader2,
  ListFilter,
} from 'lucide-react';
import { formatDistanceToNow, format, isAfter, subDays } from 'date-fns';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface VTCWithNews extends VTC {
  news: VTCNews[];
}

interface NewsWithVTC extends VTCNews {
  vtc: VTC;
}

type SortOption = 'newest' | 'oldest' | 'vtc' | 'author';
type FilterOption = 'all' | 'pinned' | 'recent' | 'verified';

// Loading skeleton component
const NewsCardSkeleton = () => (
  <div className="bg-zinc-900 rounded-xl p-6 border-2 border-white/10">
    <div className="flex items-center space-x-3 mb-4">
      <Skeleton className="w-6 h-6 rounded" />
      <div>
        <Skeleton className="h-4 w-32 mb-1" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
    <Skeleton className="h-6 w-3/4 mb-3" />
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-5/6 mb-4" />
    <div className="flex items-center space-x-6">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-32" />
    </div>
  </div>
);

// News card component
const NewsCard = ({ news, variant = 'default' }: { news: NewsWithVTC; variant?: 'default' | 'featured' }) => {
  const isPinned = news.pinned;
  const isRecent = isAfter(new Date(news.published_at), subDays(new Date(), 7));

  return (
    <Link href={`/vtcs/${news.vtc.id}/news/${news.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "bg-zinc-900 rounded-xl p-6 border-2 transition-all cursor-pointer h-full",
          variant === 'featured'
            ? "border-yellow-500/30 hover:border-yellow-500/60 shadow-lg shadow-yellow-500/10"
            : "border-white/10 hover:border-red-500/50"
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {news.vtc.logo ? (
              <img
                src={news.vtc.logo}
                alt={news.vtc.name}
                className="w-8 h-8 rounded-lg object-cover"
              />
            ) : (
              <Building2 className="w-6 h-6 text-red-500" />
            )}
            <div>
              <div className="text-white font-medium">{news.vtc.name}</div>
              <div className="text-gray-400 text-sm">[{news.vtc.tag}]</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isPinned && (
              <Badge className="bg-yellow-500 text-black">
                <Pin className="w-3 h-3 mr-1" />
                Pinned
              </Badge>
            )}
            {news.vtc.verified && (
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                Verified
              </Badge>
            )}
            {isRecent && !isPinned && (
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                New
              </Badge>
            )}
          </div>
        </div>

        <h3 className={cn(
          "font-bold text-white mb-3 line-clamp-2",
          variant === 'featured' ? "text-xl" : "text-lg"
        )}>
          {news.title}
        </h3>
        <p className="text-gray-300 text-sm mb-4 line-clamp-3">{news.content_summary}</p>

        <div className="flex items-center justify-between text-gray-400 text-sm">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span className="truncate max-w-[150px]">{news.author}</span>
          </div>
          <time
            dateTime={news.published_at}
            className="flex items-center space-x-2"
            title={format(new Date(news.published_at), 'PPpp')}
          >
            <Clock className="w-4 h-4" />
            <span>{formatDistanceToNow(new Date(news.published_at), { addSuffix: true })}</span>
          </time>
        </div>
      </motion.div>
    </Link>
  );
};

export default function NewsPage() {
  const [vtcsWithNews, setVTCsWithNews] = useState<VTCWithNews[]>([]);
  const [allNews, setAllNews] = useState<NewsWithVTC[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  const [showAllSources, setShowAllSources] = useState(false);
  const [visibleArticles, setVisibleArticles] = useState(25);
  const [articlesPerPage, setArticlesPerPage] = useState('25');

  const fetchNewsData = useCallback(async () => {
    try {
      setError(null);
      // First get all VTCs
      const vtcsData = await TruckersAPI.getVTCs();
      const allVTCs = [
        ...vtcsData.response.featured,
        ...vtcsData.response.recent,
        ...vtcsData.response.featured_cover
      ];

      // Remove duplicates based on VTC ID
      const uniqueVTCs = Array.from(
        new Map(allVTCs.map(vtc => [vtc.id, vtc])).values()
      );

      // Then fetch news for each VTC with error handling
      const vtcsWithNewsPromises = uniqueVTCs.map(async (vtc) => {
        try {
          const newsData = await TruckersAPI.getVTCNews(vtc.id);
          return {
            ...vtc,
            news: newsData.response?.news || []
          };
        } catch (error) {
          console.error(`Failed to fetch news for VTC ${vtc.id}:`, error);
          return {
            ...vtc,
            news: []
          };
        }
      });

      const vtcsWithNewsResults = await Promise.all(vtcsWithNewsPromises);

      // Filter VTCs that have news
      const vtcsWithActualNews = vtcsWithNewsResults.filter(vtc => vtc.news.length > 0);
      setVTCsWithNews(vtcsWithActualNews);

      // Create flat array of all news with VTC info
      const flatNews = vtcsWithNewsResults.flatMap(vtc =>
        vtc.news.map(news => ({
          ...news,
          vtc: vtc
        }))
      );

      setAllNews(flatNews);

    } catch (error) {
      console.error('Failed to fetch news:', error);
      setError('Failed to load news. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNewsData();
  }, [fetchNewsData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNewsData();
  }, [fetchNewsData]);

  // Memoized filtering and sorting
  const processedNews = useMemo(() => {
    let filtered = allNews;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(news =>
        news.title.toLowerCase().includes(searchLower) ||
        news.content_summary.toLowerCase().includes(searchLower) ||
        news.vtc.name.toLowerCase().includes(searchLower) ||
        news.author.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    switch (filterOption) {
      case 'pinned':
        filtered = filtered.filter(news => news.pinned);
        break;
      case 'recent':
        filtered = filtered.filter(news =>
          isAfter(new Date(news.published_at), subDays(new Date(), 7))
        );
        break;
      case 'verified':
        filtered = filtered.filter(news => news.vtc.verified);
        break;
    }

    // Apply sorting
    const sorted = [...filtered];
    switch (sortOption) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.published_at).getTime() - new Date(b.published_at).getTime());
        break;
      case 'vtc':
        sorted.sort((a, b) => a.vtc.name.localeCompare(b.vtc.name));
        break;
      case 'author':
        sorted.sort((a, b) => a.author.localeCompare(b.author));
        break;
    }

    return sorted;
  }, [allNews, searchTerm, sortOption, filterOption]);

  // Memoized statistics
  const stats = useMemo(() => ({
    total: allNews.length,
    pinned: allNews.filter(news => news.pinned).length,
    activeVTCs: vtcsWithNews.length,
    recent: allNews.filter(news =>
      isAfter(new Date(news.published_at), subDays(new Date(), 7))
    ).length
  }), [allNews, vtcsWithNews]);

  const pinnedNews = useMemo(() =>
    processedNews.filter(news => news.pinned).slice(0, 6),
    [processedNews]
  );

  const regularNews = useMemo(() =>
    processedNews.filter(news => !news.pinned || filterOption !== 'all'),
    [processedNews, filterOption]
  );

  const paginatedNews = useMemo(() => {
    return regularNews.slice(0, visibleArticles);
  }, [regularNews, visibleArticles]);

  const handleLoadMore = () => {
    setVisibleArticles(prev => prev + parseInt(articlesPerPage, 10));
  };

  useEffect(() => {
    setVisibleArticles(parseInt(articlesPerPage, 10));
  }, [articlesPerPage]);


  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="pt-24 pb-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <Skeleton className="h-12 w-96 mx-auto mb-6" />
              <Skeleton className="h-6 w-[600px] mx-auto" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <NewsCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <Button onClick={handleRefresh} variant="outline" className="text-white">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
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
            <h1 className="text-5xl font-bold text-white mb-6 flex items-center justify-center">
              <Newspaper className="w-12 h-12 mr-4 text-red-500" />
              VTC News Hub
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Stay updated with the latest news, announcements, and updates from Virtual Trucking Companies across the TruckersMP community.
            </p>
          </motion.div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <StatCard
                title="Total Articles"
                value={stats.total}
                subtitle="All VTC news"
                icon={Newspaper}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <StatCard
                title="Pinned Articles"
                value={stats.pinned}
                subtitle="Important updates"
                icon={Pin}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <StatCard
                title="Active VTCs"
                value={stats.activeVTCs}
                subtitle="Publishing news"
                icon={Building2}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <StatCard
                title="This Week"
                value={stats.recent}
                subtitle="Recent articles"
                icon={TrendingUp}
              />
            </motion.div>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search news articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-zinc-900 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-white/10 hover:text-white hover:bg-zinc-900">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter: {filterOption === 'all' ? 'All' : filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10">
                    <DropdownMenuLabel className="text-gray-400">Filter by</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem
                      onClick={() => setFilterOption('all')}
                      className={cn("text-white", filterOption === 'all' && "bg-red-500/20")}
                    >
                      All Articles
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setFilterOption('pinned')}
                      className={cn("text-white", filterOption === 'pinned' && "bg-red-500/20")}
                    >
                      <Pin className="w-4 h-4 mr-2" />
                      Pinned Only
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setFilterOption('recent')}
                      className={cn("text-white", filterOption === 'recent' && "bg-red-500/20")}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Recent (7 days)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setFilterOption('verified')}
                      className={cn("text-white", filterOption === 'verified' && "bg-red-500/20")}
                    >
                      <Badge className="w-4 bg-white h-4 mr-2" />
                      Verified VTCs
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-white/10 hover:text-white hover:bg-zinc-900">
                      {sortOption === 'newest' ? <SortDesc className="w-4 h-4 mr-2" /> : <SortAsc className="w-4 h-4 mr-2" />}
                      Sort: {sortOption.charAt(0).toUpperCase() + sortOption.slice(1)}
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10">
                    <DropdownMenuLabel className="text-gray-400">Sort by</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem
                      onClick={() => setSortOption('newest')}
                      className={cn("text-white", sortOption === 'newest' && "bg-red-500/20")}
                    >
                      <SortDesc className="w-4 h-4 mr-2" />
                      Newest First
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortOption('oldest')}
                      className={cn("text-white", sortOption === 'oldest' && "bg-red-500/20")}
                    >
                      <SortAsc className="w-4 h-4 mr-2" />
                      Oldest First
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortOption('vtc')}
                      className={cn("text-white", sortOption === 'vtc' && "bg-red-500/20")}
                    >
                      <Building2 className="w-4 h-4 mr-2" />
                      VTC Name
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortOption('author')}
                      className={cn("text-white", sortOption === 'author' && "bg-red-500/20")}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Author Name
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  className="border-white/10 hover:text-white hover:bg-zinc-900"
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {searchTerm && (
              <div className="text-sm text-gray-400">
                Found {processedNews.length} result{processedNews.length !== 1 ? 's' : ''} for {`"`}{searchTerm}{`"`}
              </div>
            )}
          </div>

          {/* Featured/Pinned News */}
          {pinnedNews.length > 0 && filterOption === 'all' && !searchTerm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
                <Pin className="w-8 h-8 mr-3 text-yellow-500" />
                Pinned Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {pinnedNews.map((news, index) => (
                    <motion.div
                      key={`${news.vtc.id}-${news.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <NewsCard news={news} variant="featured" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* All News */}
          <div>
            <div className="flex flex-col md:flex-row items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white mb-4 md:mb-0 flex items-center">
                <span>{filterOption === 'all' && !searchTerm ? 'Latest News' : 'News Articles'}</span>
              </h2>
              <div className="flex items-center gap-2">
                {regularNews.length > 0 && (
                  <span className="text-base font-normal text-gray-400">
                    Showing {paginatedNews.length} of {regularNews.length} article{regularNews.length !== 1 ? 's' : ''}
                  </span>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-white/10 hover:text-white hover:bg-zinc-900">
                      <ListFilter className="w-4 h-4 mr-2" />
                      Show: {articlesPerPage}
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10">
                    <DropdownMenuRadioGroup value={articlesPerPage} onValueChange={setArticlesPerPage}>
                      <DropdownMenuLabel className="text-gray-400">Articles per page</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuRadioItem value="25" className="text-white">25</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="50" className="text-white">50</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="75" className="text-white">75</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="100" className="text-white">100</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {paginatedNews.length > 0 ? (
                <motion.div
                  layout
                  className="grid grid-cols-1 gap-6"
                >
                  {paginatedNews.map((news, index) => (
                    <motion.div
                      key={`${news.vtc.id}-${news.id}`}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <NewsCard news={news} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 bg-zinc-900 rounded-xl border-2 border-white/10"
                >
                  <Newspaper className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <div className="text-gray-400 text-xl">No news articles found</div>
                  <p className="text-gray-500 mt-2">
                    {searchTerm ? 'Try adjusting your search terms' : 'Check back later for updates'}
                  </p>
                  {searchTerm && (
                    <Button
                      onClick={() => setSearchTerm('')}
                      variant="outline"
                      className="mt-4 text-white border-white/10"
                    >
                      Clear Search
                    </Button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            {visibleArticles < regularNews.length && (
              <div className="mt-8 text-center">
                <Button onClick={handleLoadMore} variant="outline" className="hover:text-white border-white/10 hover:bg-red-500/20">
                  Load More
                </Button>
              </div>
            )}
          </div>

          {/* VTC News Sources */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-16"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white">News Sources</h2>
              {vtcsWithNews.length > 12 && (
                <Button
                  onClick={() => setShowAllSources(!showAllSources)}
                  variant="outline"
                  className="text-white border-white/10"
                >
                  {showAllSources ? 'Show Less' : `Show All (${vtcsWithNews.length})`}
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {vtcsWithNews
                  .slice(0, showAllSources ? undefined : 12)
                  .map((vtc, index) => (
                    <motion.div
                      key={vtc.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link href={`/vtcs/${vtc.id}`}>
                        <div className="bg-zinc-900 rounded-xl p-6 border-2 border-white/10 hover:border-red-500/50 transition-all cursor-pointer h-full group">
                          <div className="flex items-center space-x-4 mb-4">
                            {vtc.logo ? (
                              <img
                                src={vtc.logo}
                                alt={vtc.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-gray-500" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-bold truncate group-hover:text-red-500 transition-colors">
                                {vtc.name}
                              </h3>
                              <div className="text-gray-400 text-sm">[{vtc.tag}]</div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="text-gray-400">
                              <Newspaper className="w-4 h-4 inline mr-1" />
                              {vtc.news.length} article{vtc.news.length !== 1 ? 's' : ''}
                            </div>
                            <div className="text-gray-400">
                              <User className="w-4 h-4 inline mr-1" />
                              {vtc.members_count.toLocaleString()}
                            </div>
                          </div>

                          {vtc.verified && (
                            <Badge className="mt-3 bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                              Verified VTC
                            </Badge>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}