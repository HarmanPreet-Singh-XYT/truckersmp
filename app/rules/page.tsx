'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Navigation } from '@/components/ui/navigation';
import { TruckersAPI } from '@/lib/api';
import { Rules } from '@/types/api';
import { 
  BookOpen, 
  FileText, 
  Clock, 
  AlertCircle, 
  RefreshCw,
  Search,
  ChevronUp,
  Copy,
  Check
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Footer from '@/components/footer';

// Skeleton loader component
function RulesSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-zinc-900 rounded-xl p-6 border-2 border-white/10 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-6 h-6 bg-zinc-700 rounded"></div>
            <div>
              <div className="h-5 bg-zinc-700 rounded w-32 mb-2"></div>
              <div className="h-4 bg-zinc-700 rounded w-48"></div>
            </div>
          </div>
          <div className="h-4 bg-zinc-700 rounded w-24"></div>
        </div>
      </div>
      <div className="bg-zinc-900 rounded-xl border-2 border-white/10 p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i}>
              <div className="h-6 bg-zinc-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-zinc-700 rounded w-full mb-1"></div>
              <div className="h-4 bg-zinc-700 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RulesPage() {
  const [rules, setRules] = useState<Rules | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await TruckersAPI.getRules();
      setRules(data);
    } catch (error) {
      console.error('Failed to fetch rules:', error);
      setError('Failed to load rules. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const highlightText = (text: string) => {
    if (!searchQuery) return text;
    
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-500/30 text-yellow-200 rounded px-1">$1</mark>');
  };

  const formatRevisionDate = (revision: string) => {
    // Assuming revision format includes date info
    return `Last updated: ${revision}`;
  };

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      <div className="pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 flex items-center justify-center">
              <BookOpen className="w-10 sm:w-12 h-10 sm:h-12 mr-4 text-red-500" />
              TruckersMP Rules
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
              Important guidelines and regulations for all TruckersMP players.
            </p>
          </div>

          {/* Search Bar */}
          {rules && !loading && !error && (
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search rules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-zinc-900 border-2 border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-red-500/50 focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && <RulesSkeleton />}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-500/10 border-2 border-red-500/50 rounded-xl p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Error Loading Rules</h3>
              <p className="text-gray-300 mb-6">{error}</p>
              <button
                onClick={fetchRules}
                className="inline-flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>
            </div>
          )}

          {/* Rules Content */}
          {rules && !loading && !error && (
            <>
              {/* Rules Info */}
              <div className="bg-zinc-900 rounded-xl p-6 border-2 border-white/10 mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <FileText className="w-6 h-6 text-red-500 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-bold text-white">Rules Document</h3>
                      <p className="text-gray-400">Official TruckersMP community guidelines</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={copyLink}
                      className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                      title="Copy link to rules"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      <span className="text-sm">{copied ? 'Copied!' : 'Share'}</span>
                    </button>
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{rules.revision}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rules Content with Markdown */}
              <div className="bg-zinc-900 rounded-xl border-2 border-white/10 overflow-hidden">
                <div ref={contentRef} className="p-6 sm:p-8">
                  <div className="prose prose-invert prose-red max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // Custom styling for markdown elements
                        h1: ({ children }) => (
                          <h1 className="text-3xl font-bold text-white mb-6 mt-8 first:mt-0">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-2xl font-bold text-white mb-4 mt-6">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-xl font-bold text-white mb-3 mt-4">
                            {children}
                          </h3>
                        ),
                        p: ({ children }) => (
                          <p 
                            className="text-gray-300 mb-4 leading-relaxed"
                            dangerouslySetInnerHTML={
                              searchQuery 
                                ? { __html: highlightText(String(children)) }
                                : undefined
                            }
                          >
                            {!searchQuery && children}
                          </p>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside space-y-2 mb-4 text-gray-300">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-300">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="ml-4">{children}</li>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-bold text-white">{children}</strong>
                        ),
                        em: ({ children }) => (
                          <em className="italic text-gray-200">{children}</em>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-red-500 pl-4 py-2 my-4 bg-zinc-800/50 rounded-r">
                            {children}
                          </blockquote>
                        ),
                        code: ({ children }) => (
                          <code className="bg-zinc-800 px-2 py-1 rounded text-red-400 text-sm">
                            {children}
                          </code>
                        ),
                        pre: ({ children }) => (
                          <pre className="bg-zinc-800 p-4 rounded-lg overflow-x-auto mb-4">
                            {children}
                          </pre>
                        ),
                        a: ({ href, children }) => (
                          <a 
                            href={href}
                            className="text-red-400 hover:text-red-300 underline transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {rules.rules}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>

              {/* Important Notice */}
              <div className="mt-8 bg-red-500/20 border-2 border-red-500/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-red-400 mb-3 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Important Notice
                </h3>
                <p className="text-gray-300">
                  All players are expected to read and follow these rules. Violations may result in 
                  temporary or permanent bans from TruckersMP servers. Rules are subject to change 
                  and players are responsible for staying updated with the latest revision.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all transform hover:scale-110 z-50"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
      <Footer/>
    </div>
  );
}