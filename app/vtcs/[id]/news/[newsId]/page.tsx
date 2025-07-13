'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navigation } from '@/components/ui/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TruckersAPI } from '@/lib/api';
import { VTC, VTCNews } from '@/types/api';
import { 
  ArrowLeft,
  Building2,
  User,
  Calendar,
  Clock,
  Pin,
  Shield,
  ExternalLink,
  Newspaper,
  Edit,
  Share2,
  BookOpen,
  AlertCircle,
  Facebook,
  Twitter,
  Link as LinkIcon
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
// Helper function to calculate reading time
const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const textContent = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
  const wordCount = textContent.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

// Loading skeleton component
const ArticleSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-zinc-900 rounded-xl p-8 border-2 border-white/10 mb-8">
      <div className="flex items-center space-x-4 mb-6">
        <Skeleton className="w-16 h-16 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <Skeleton className="h-12 w-full mb-6" />
      <div className="flex items-center space-x-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
    <div className="bg-zinc-900 rounded-xl p-8 border-2 border-white/10">
      <Skeleton className="h-32 w-full mb-8" />
      <Skeleton className="h-96 w-full" />
    </div>
  </div>
);

// Share menu component
const ShareMenu = ({ url, title }: { url: string; title: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  const shareOptions = [
    {
      name: 'Twitter',
      icon: Twitter,
      action: () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank')
    },
    {
      name: 'Facebook',
      icon: Facebook,
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
    },
    {
      name: 'Copy Link',
      icon: LinkIcon,
      action: async () => {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
        setIsOpen(false);
      }
    }
  ];

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="border-white/10 hover:text-white hover:bg-white/10"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-zinc-900 rounded-lg shadow-xl border border-white/10 z-10">
          {shareOptions.map((option) => (
            <button
              key={option.name}
              onClick={option.action}
              className="flex items-center space-x-3 w-full px-4 py-3 hover:bg-white/5 transition-colors text-left"
            >
              <option.icon className="w-4 h-4 text-gray-400" />
              <span className="text-white text-sm">{option.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Error component
const ErrorState = ({ error, onRetry }: { error: string; onRetry?: () => void }) => (
  <div className="min-h-screen bg-black">
    <Navigation />
    <div className="pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong</h1>
        <p className="text-gray-400 mb-6">{error}</p>
        <div className="flex gap-4 justify-center">
          <Link href="/news">
            <Button className="bg-red-500 hover:bg-red-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to News
            </Button>
          </Link>
          {onRetry && (
            <Button variant="outline" onClick={onRetry} className="border-white/10">
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Related news item component
const RelatedNewsItem = ({ article, vtcId }: { article: VTCNews; vtcId: number }) => (
  <Link href={`/vtcs/${vtcId}/news/${article.id}`}>
    <article className="bg-black rounded-lg p-4 hover:bg-white/5 transition-all duration-200 cursor-pointer group">
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-white font-medium text-sm line-clamp-2 flex-1 group-hover:text-red-400 transition-colors">
          {article.title}
        </h4>
        {article.pinned && (
          <Pin className="w-4 h-4 text-yellow-500 ml-2 flex-shrink-0" />
        )}
      </div>
      <p className="text-gray-400 text-xs line-clamp-2 mb-2">
        {article.content_summary}
      </p>
      <div className="flex items-center justify-between text-gray-500 text-xs">
        <span>{article.author}</span>
        <time dateTime={article.published_at}>
          {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
        </time>
      </div>
    </article>
  </Link>
);

export default function NewsArticlePage() {
  const params = useParams();
  const router = useRouter();
  const [news, setNews] = useState<VTCNews | null>(null);
  const [vtc, setVTC] = useState<VTC | null>(null);
  const [relatedNews, setRelatedNews] = useState<VTCNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate reading time
  const readingTime = useMemo(() => {
    if (!news?.content) return 0;
    return calculateReadingTime(news.content);
  }, [news?.content]);

  // Generate share URL
  const shareUrl = useMemo(() => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return '';
  }, []);

  const fetchNewsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const vtcId = parseInt(params.id as string);
      const newsId = parseInt(params.newsId as string);
      
      if (isNaN(vtcId) || isNaN(newsId)) {
        throw new Error('Invalid VTC or news ID');
      }
      
      const [newsData, vtcData, allNewsData] = await Promise.all([
        TruckersAPI.getVTCNewsItem(vtcId, newsId),
        TruckersAPI.getVTC(vtcId),
        TruckersAPI.getVTCNews(vtcId)
      ]);
      
      if (!newsData.response || !vtcData.response) {
        throw new Error('Article not found');
      }
      
      setNews(newsData.response);
      setVTC(vtcData.response);
      
      // Get related news (exclude current article)
      const related = allNewsData.response?.news?.filter(n => n.id !== newsId) || [];
      setRelatedNews(related.slice(0, 5));
      
    } catch (err: any) {
      console.error('Error fetching news data:', err);
      setError(err.message || 'Failed to load news article');
    } finally {
      setLoading(false);
    }
  }, [params.id, params.newsId]);

  useEffect(() => {
    fetchNewsData();
  }, [fetchNewsData]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.push('/news');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="pt-24 pb-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                <ArticleSkeleton />
              </div>
              <div className="space-y-8">
                <Skeleton className="h-64 w-full rounded-xl" />
                <Skeleton className="h-96 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !news || !vtc) {
    return <ErrorState error={error || 'News article not found'} onRetry={fetchNewsData} />;
  }

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      <main className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb Navigation */}
          <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm" aria-label="Breadcrumb">
            <Link href="/news" className="text-gray-400 hover:text-white transition-colors">
              News
            </Link>
            <span className="text-gray-600">/</span>
            <Link href={`/vtcs/${vtc.id}`} className="text-gray-400 hover:text-white transition-colors">
              {vtc.name}
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-white truncate max-w-xs">{news.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Article Header */}
              <header className="bg-zinc-900 rounded-xl p-6 sm:p-8 border-2 border-white/10 mb-8">
                {/* VTC Info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                  {vtc.logo && (
                    <img 
                      src={vtc.logo} 
                      alt={`${vtc.name} logo`}
                      className="w-16 h-16 rounded-xl border-2 border-white/10 object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h2 className="text-xl font-bold text-white">{vtc.name}</h2>
                      <Badge className="bg-red-500 text-white">
                        [{vtc.tag}]
                      </Badge>
                      {vtc.verified && (
                        <Badge className="bg-blue-500 text-white">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {news.pinned && (
                        <Badge className="bg-yellow-500 text-black">
                          <Pin className="w-3 h-3 mr-1" />
                          Pinned
                        </Badge>
                      )}
                    </div>
                    {vtc.slogan && (
                      <p className="text-gray-400 text-sm sm:text-base">{vtc.slogan}</p>
                    )}
                  </div>
                </div>

                {/* Article Title */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                  {news.title}
                </h1>

                {/* Article Meta */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm sm:text-base text-gray-400 mb-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    <Link href={`/players/${news.author_id}`}><span className='hover:text-red-500'>by {news.author}</span></Link>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                    <time dateTime={news.published_at}>
                                            {format(new Date(news.published_at), 'MMMM d, yyyy')}
                    </time>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>{formatDistanceToNow(new Date(news.published_at), { addSuffix: true })}</span>
                  </div>
                  {news.content && (
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>{readingTime} min read</span>
                    </div>
                  )}
                </div>

                {/* Updated indicator */}
                {news.updated_at !== news.published_at && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Edit className="w-4 h-4" />
                    <span>
                      Updated {format(new Date(news.updated_at), 'MMMM d, yyyy')} 
                      ({formatDistanceToNow(new Date(news.updated_at), { addSuffix: true })})
                    </span>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3 mt-6">
                  <ShareMenu url={shareUrl} title={news.title} />
                  <Link href={`/vtcs/${vtc.id}`}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-white/10 hover:text-white hover:bg-white/10"
                    >
                      <Building2 className="w-4 h-4 mr-2" />
                      View VTC
                    </Button>
                  </Link>
                </div>
              </header>

              {/* Article Content */}
              <article className="bg-zinc-900 rounded-xl p-6 sm:p-8 border-2 border-white/10">
                {/* Summary */}
                <div className="bg-gradient-to-r from-red-500/10 to-transparent rounded-lg p-6 mb-8 border-l-4 border-red-500">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Newspaper className="w-5 h-5" />
                    Summary
                  </h3>
                  <p className="text-gray-300 leading-relaxed">{news.content_summary}</p>
                </div>

                {/* Full Content */}
                {news.content ? (
                  <div 
                    className="prose text-white prose-invert prose-lg max-w-none
                      prose-headings:text-white prose-headings:font-bold
                      prose-p:text-gray-300 prose-p:leading-relaxed
                      prose-a:text-red-400 prose-a:no-underline hover:prose-a:underline
                      prose-strong:text-white prose-strong:font-semibold
                      prose-ul:text-gray-300 prose-ol:text-gray-300
                      prose-blockquote:border-l-red-500 prose-blockquote:text-gray-400
                      prose-code:text-red-400 prose-code:bg-black/50 prose-code:rounded
                      prose-pre:bg-black prose-pre:border prose-pre:border-white/10
                      prose-img:rounded-lg prose-img:border-2 prose-img:border-white/10"
                  ><ReactMarkdown>{news.content}</ReactMarkdown></div>
                ) : (
                  <div className="text-center py-12">
                    <Newspaper className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h4 className="text-gray-400 text-xl font-medium mb-2">Full content not available</h4>
                    <p className="text-gray-500">Only the summary is provided for this article</p>
                  </div>
                )}

                {/* Article Footer */}
                <footer className="mt-12 pt-8 border-t border-white/10">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="text-sm text-gray-400">
                      <p>Published by <Link href={`/players/${news.author_id}`}><span className="text-white hover:text-red-400 font-medium">{news.author}</span></Link></p>
                      <p className="mt-1">
                        Article ID: <span className="text-white font-mono">#{news.id}</span>
                      </p>
                    </div>
                    <ShareMenu url={shareUrl} title={news.title} />
                  </div>
                </footer>
              </article>

              {/* Mobile-only related news */}
              <div className="lg:hidden mt-8">
                {relatedNews.length > 0 && (
                  <section className="bg-zinc-900 rounded-xl p-6 border-2 border-white/10">
                    <h3 className="text-xl font-bold text-white mb-4">More from {vtc.name}</h3>
                    <div className="space-y-4 grid">
                      {relatedNews.map((article) => (
                        <RelatedNewsItem key={article.id} article={article} vtcId={vtc.id} />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:sticky lg:top-24 space-y-6 lg:space-y-8 self-start">
              {/* Article Info */}
              <section className="bg-zinc-900 rounded-xl p-6 border-2 border-white/10">
                <h3 className="text-xl font-bold text-white mb-4">Article Information</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Article ID</dt>
                    <dd className="text-white font-mono">#{news.id}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Author</dt>
                    <Link href={`/players/${news.author_id}`}><dd className="text-white hover:text-red-400">{news.author}</dd></Link>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Published</dt>
                    <dd className="text-white">
                      <time dateTime={news.published_at}>
                        {format(new Date(news.published_at), 'MMM d, yyyy')}
                      </time>
                    </dd>
                  </div>
                  {news.updated_at !== news.published_at && (
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Last Updated</dt>
                      <dd className="text-white">
                        <time dateTime={news.updated_at}>
                          {format(new Date(news.updated_at), 'MMM d, yyyy')}
                        </time>
                      </dd>
                    </div>
                  )}
                  {news.content && (
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Reading Time</dt>
                      <dd className="text-white">{readingTime} min</dd>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <dt className="text-gray-400">Status</dt>
                    <dd>
                      {news.pinned ? (
                        <Badge className="bg-yellow-500 text-white text-xs">
                          <Pin className="w-3 h-3 mr-1" />
                          Pinned
                        </Badge>
                      ): (
                        <Badge className="bg-white text-black text-xs">
                          <Pin className="w-3 h-3 mr-1" />
                          Not Pinned
                        </Badge>
                      )}
                    </dd>
                  </div>
                </dl>
              </section>

              {/* VTC Quick Info */}
              <section className="bg-zinc-900 rounded-xl p-6 border-2 border-white/10">
                <h3 className="text-xl font-bold text-white mb-4">About {vtc.name}</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {vtc.logo ? (
                      <img 
                        src={vtc.logo} 
                        alt={`${vtc.name} logo`}
                        className="w-12 h-12 rounded-lg border border-white/10 object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-red-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">{vtc.name}</div>
                      <div className="text-gray-400 text-sm">[{vtc.tag}]</div>
                    </div>
                  </div>
                  
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Members</dt>
                      <dd className="text-white font-medium">{vtc.members_count.toLocaleString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Language</dt>
                      <dd className="text-white">{vtc.language}</dd>
                    </div>
                    <div className="flex justify-between items-center">
                      <dt className="text-gray-400">Recruitment</dt>
                      <dd>
                        <Badge 
                          variant={vtc.recruitment === 'open' ? 'default' : 'secondary'}
                          className={vtc.recruitment === 'open' ? 'bg-green-500' : ''}
                        >
                          {vtc.recruitment}
                        </Badge>
                      </dd>
                    </div>
                    {vtc.verified && (
                      <div className="flex justify-between items-center">
                        <dt className="text-gray-400">Status</dt>
                        <dd>
                          <Badge className="bg-blue-500 text-white text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        </dd>
                      </div>
                    )}
                  </dl>

                  <Link href={`/vtcs/${vtc.id}`}>
                    <Button className="w-full mt-4 bg-red-500 hover:bg-red-600 transition-colors">
                      View VTC Profile
                    </Button>
                  </Link>
                </div>
              </section>

              {/* Related News - Desktop only */}
              {relatedNews.length > 0 && (
                <section className="hidden lg:block bg-zinc-900 rounded-xl p-6 border-2 border-white/10">
                  <h3 className="text-xl font-bold text-white mb-4">More from {vtc.name}</h3>
                  <div className="space-y-4 grid">
                    {relatedNews.map((article) => (
                      <RelatedNewsItem key={article.id} article={article} vtcId={vtc.id} />
                    ))}
                  </div>
                  
                  {relatedNews.length >= 5 && (
                    <Link href={`/vtcs/${vtc.id}`}>
                      <Button 
                        variant="outline" 
                        className="w-full mt-4 border-white/10 hover:text-white hover:bg-white/10"
                      >
                        View All News
                      </Button>
                    </Link>
                  )}
                </section>
              )}

              {/* VTC Links */}
              {(vtc.website || Object.values(vtc.socials).some(link => link)) && (
                <section className="bg-zinc-900 rounded-xl p-6 border-2 border-white/10">
                  <h3 className="text-xl font-bold text-white mb-4">VTC Links</h3>
                  <nav className="space-y-3" aria-label="VTC external links">
                    {vtc.website && (
                      <a 
                        href={vtc.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-black rounded-lg hover:bg-white/5 transition-colors group"
                      >
                        <ExternalLink className="w-5 h-5 text-blue-500 group-hover:text-blue-400" />
                        <span className="text-white group-hover:text-red-400 transition-colors">
                          Official Website
                        </span>
                      </a>
                    )}
                    
                    {Object.entries(vtc.socials).map(([platform, url]) => {
                      if (!url) return null;
                      
                      const platformIcons: Record<string, any> = {
                        twitter: Twitter,
                        facebook: Facebook,
                      };
                      
                      const Icon = platformIcons[platform] || ExternalLink;
                      
                      return (
                        <a 
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-black rounded-lg hover:bg-white/5 transition-colors group"
                          aria-label={`Visit ${vtc.name} on ${platform}`}
                        >
                          <Icon className="w-5 h-5 text-gray-400 group-hover:text-white" />
                          <span className="text-white capitalize group-hover:text-red-400 transition-colors">
                            {platform}
                          </span>
                        </a>
                      );
                    })}
                  </nav>
                </section>
              )}
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}