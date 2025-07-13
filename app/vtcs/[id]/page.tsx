'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navigation } from '@/components/ui/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TruckersAPI } from '@/lib/api';
import { VTC, VTCMember, VTCNews, Event } from '@/types/api';
import { 
  Users, 
  Shield, 
  Globe, 
  Calendar,
  ExternalLink,
  Twitter,
  Facebook,
  Youtube,
  ArrowLeft,
  Building2,
  User,
  Crown,
  Clock,
  MapPin
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReactMarkdown from 'react-markdown';
import Footer from '@/components/footer';
import { FaDiscord, FaFacebook, FaTwitter, FaYoutube } from 'react-icons/fa';

export default function VTCDetailPage() {
  const params = useParams();
  const [vtc, setVTC] = useState<VTC | null>(null);
  const [members, setMembers] = useState<VTCMember[]>([]);
  const [news, setNews] = useState<VTCNews[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVTCData = async () => {
      try {
        const vtcId = parseInt(params.id as string);
        if (isNaN(vtcId)) {
          throw new Error('Invalid VTC ID');
        }
        
        const [vtcData, membersData, newsData, eventsData] = await Promise.all([
          TruckersAPI.getVTC(vtcId),
          TruckersAPI.getVTCMembers(vtcId).catch(() => ({ response: { members: [] } })),
          TruckersAPI.getVTCNews(vtcId).catch(() => ({ response: { news: [] } })),
          TruckersAPI.getVTCEvents(vtcId).catch(() => ({ response: [] }))
        ]);
        
        setVTC(vtcData.response);
        setMembers(membersData.response?.members || []);
        setNews(newsData.response?.news || []);
        setEvents(eventsData.response || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load VTC');
      } finally {
        setLoading(false);
      }
    };

    fetchVTCData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading VTC Details...</div>
        </div>
      </div>
    );
  }

  if (error || !vtc) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="pt-24 pb-12 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-red-400 text-xl mb-4">{error || 'VTC not found'}</div>
            <Link href="/vtcs">
              <Button className="bg-red-500 hover:bg-red-600">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to VTCs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return <FaTwitter color='white' className="w-5 h-5" />;
      case 'facebook': return <FaFacebook color='white' className="w-5 h-5" />;
      case 'youtube': return <FaYoutube color='white' className="w-5 h-5" />;
      case 'discord': return <FaDiscord color='white' className="w-5 h-5" />;
      default: return <ExternalLink color='white' className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      <div className="pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <div className="mb-8">
            <Link href="/vtcs">
              <Button variant="outline" className="border-white/10 hover:text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to VTCs
              </Button>
            </Link>
          </div>

          {/* VTC Header */}
          <div className="relative mb-12">
            {vtc.cover && (
              <div className="absolute inset-0 rounded-xl overflow-hidden">
                <img 
                  src={vtc.cover} 
                  alt={vtc.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
              </div>
            )}
            <div className="relative bg-zinc-900/60 rounded-xl p-8 border-2 border-white/10">
              <div className="flex items-start space-x-6">
                {vtc.logo && (
                  <img 
                    src={vtc.logo} 
                    alt={vtc.name}
                    className="w-24 h-24 rounded-xl border-2 border-white/10"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <Badge className="bg-red-500 text-white">
                      [{vtc.tag}]
                    </Badge>
                    {vtc.verified && (
                      <Badge className="bg-blue-500 text-white">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {vtc.validated && (
                      <Badge className="bg-green-500 text-white">
                        Validated
                      </Badge>
                    )}
                    <Badge variant="outline" className="border-white/20 text-white">
                      {vtc.recruitment}
                    </Badge>
                  </div>
                  <h1 className="text-5xl font-bold text-white mb-4">{vtc.name}</h1>
                  {vtc.slogan && (
                    <p className="text-xl text-gray-300 mb-4">{vtc.slogan}</p>
                  )}
                  <div className="flex items-center space-x-6 text-gray-300">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-red-500" />
                      <span>{vtc.members_count} members</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-red-500" />
                      <Link href={`/players/${vtc.owner_id}`}><span className='hover:text-red-400'>Owner: {vtc.owner_username}</span></Link>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Globe className="w-5 h-5 text-red-500" />
                      <span>{vtc.language}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-red-500" />
                      <span>Founded {formatDistanceToNow(new Date(vtc.created), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Games Supported */}
          <div className="mb-8">
            <div className="flex items-center space-x-4">
              <span className="text-white font-medium">Supported Games:</span>
              {vtc.games.ets && (
                <Badge className="bg-blue-600 text-white">ETS2</Badge>
              )}
              {vtc.games.ats && (
                <Badge className="bg-orange-600 text-white">ATS</Badge>
              )}
            </div>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8 bg-zinc-900">
              <TabsTrigger value="overview" className="data-[state=active]:bg-red-500">
                Overview
              </TabsTrigger>
              <TabsTrigger value="members" className="data-[state=active]:bg-red-500">
                Members ({members.length})
              </TabsTrigger>
              <TabsTrigger value="news" className="data-[state=active]:bg-red-500">
                News ({news.length})
              </TabsTrigger>
              <TabsTrigger value="events" className="data-[state=active]:bg-red-500">
                Events ({events.length})
              </TabsTrigger>
              <TabsTrigger value="contact" className="data-[state=active]:bg-red-500">
                Contact
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  {/* Information */}
                  {vtc.information && (
                    <div className="bg-zinc-900 rounded-xl p-6 border-2 border-white/10">
                      <h2 className="text-2xl font-bold text-white mb-4">About</h2>
                      <div 
                        className="text-gray-300 leading-relaxed prose prose-invert max-w-none"
                      ><ReactMarkdown>{vtc.information}</ReactMarkdown></div>
                    </div>
                  )}

                  {/* Rules */}
                  {vtc.rules && (
                    <div className="bg-zinc-900 rounded-xl p-6 border-2 border-white/10">
                      <h2 className="text-2xl font-bold text-white mb-4">Rules</h2>
                      <div 
                        className="text-gray-300 leading-relaxed prose prose-invert max-w-none"
                      ><ReactMarkdown>{vtc.rules}</ReactMarkdown></div>
                    </div>
                  )}

                  {/* Requirements */}
                  {vtc.requirements && (
                    <div className="bg-zinc-900 rounded-xl p-6 border-2 border-white/10">
                      <h2 className="text-2xl font-bold text-white mb-4">Requirements</h2>
                      <div 
                        className="text-gray-300 leading-relaxed prose prose-invert max-w-none"
                      ><ReactMarkdown>{vtc.requirements}</ReactMarkdown></div>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                  {/* Quick Stats */}
                  <div className="bg-zinc-900 rounded-xl p-6 border-2 border-white/10">
                    <h3 className="text-xl font-bold text-white mb-4">Quick Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Members</span>
                        <span className="text-white font-bold">{vtc.members_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Recruitment</span>
                        <Badge variant={vtc.recruitment === 'open' ? 'default' : 'secondary'}>
                          {vtc.recruitment}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Language</span>
                        <span className="text-white">{vtc.language}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Founded</span>
                        <span className="text-white">
                          {new Date(vtc.created).getFullYear()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recent News */}
                  {news.length > 0 && (
                    <div className="bg-zinc-900 rounded-xl p-6 border-2 border-white/10">
                      <h3 className="text-xl font-bold text-white mb-4">Latest News</h3>
                      <div className="space-y-4 grid">
                        {news.slice(0, 3).map((article) => (
                          <Link key={article.id} href={`/vtcs/${vtc.id}/news/${article.id}`}><div className="bg-black hover:bg-black/60 rounded-lg p-4">
                            <h4 className="text-white font-medium mb-2">{article.title}</h4>
                            <p className="text-gray-400 text-sm mb-2">{article.content_summary}</p>
                            <div className="text-gray-500 text-xs">
                              by {article.author} • {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
                            </div>
                          </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="members">
              <div className="bg-zinc-900 rounded-xl p-6 border-2 border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6">Members ({members.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {members.map((member) => (
                    <div key={member.id} className="bg-black hover:bg-black/50 rounded-lg p-4">
                    <Link href={`/players/${member.id}`}>
                      <div className="flex items-center space-x-3 mb-3">
                        <User className="w-8 h-8 text-gray-400" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-medium">{member.username}</span>
                            {member.is_owner && (
                              <Crown className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                          <div className="text-gray-400 text-sm">{member.role}</div>
                        </div>
                      </div>
                      <div className="text-gray-500 text-xs">
                        Joined {formatDistanceToNow(new Date(member.joinDate), { addSuffix: true })}
                      </div>
                      </Link>
                    </div>
                  ))}
                </div>
                {members.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-gray-400">No member information available</div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="news">
              <div className="space-y-6 grid">
                {news.map((article) => (
                  <Link key={article.id} href={`/vtcs/${vtc.id}/news/${article.id}`}><div className="bg-zinc-900 rounded-xl p-6 border-2 border-white/10 hover:border-red-500/50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{article.title}</h3>
                        <div className="flex items-center space-x-4 text-gray-400 text-sm">
                          <span>by {article.author}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}</span>
                          {article.pinned && (
                            <>
                              <span>•</span>
                              <Badge className="bg-yellow-500 text-black text-xs">Pinned</Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{article.content_summary}</p>
                  </div>
                  </Link>
                ))}
                {news.length === 0 && (
                  <div className="bg-zinc-900 rounded-xl p-12 border-2 border-white/10 text-center">
                    <div className="text-gray-400 text-xl">No news articles available</div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="events">
              <div className="space-y-6 flex flex-col">
                {events.map((event) => (
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <div className="bg-zinc-900 rounded-xl p-6 border-2 border-white/10 hover:border-red-500/50 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">{event.name}</h3>
                          <div className="flex items-center space-x-4 text-gray-400 text-sm mb-3">
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{event.departure.city} → {event.arrive.city}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(event.start_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{new Date(event.start_at).toLocaleTimeString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Badge className="bg-red-500 text-white">
                              {event.event_type.name}
                            </Badge>
                            <div className="flex items-center space-x-2 text-gray-400">
                              <Users className="w-4 h-4" />
                              <span>{event.attendances.confirmed} confirmed</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {event.description && (
                        <p className="text-gray-300 line-clamp-2"><ReactMarkdown>{event.description}</ReactMarkdown></p>
                      )}
                    </div>
                  </Link>
                ))}
                {events.length === 0 && (
                  <div className="bg-zinc-900 rounded-xl p-12 border-2 border-white/10 text-center">
                    <div className="text-gray-400 text-xl">No events available</div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="contact">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Social Links */}
                <div className="bg-zinc-900 rounded-xl p-6 border-2 border-white/10">
                  <h2 className="text-2xl font-bold text-white mb-6">Social Media</h2>
                  <div className="space-y-4">
                    {Object.entries(vtc.social).map(([platform, url]) => {
                      if (!url) return null;
                      return (
                        <a 
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 p-3 bg-black rounded-lg hover:bg-white/5 transition-colors"
                        >
                          {getSocialIcon(platform)}
                          <span className="text-white capitalize">{platform}</span>
                          <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                        </a>
                      );
                    })}
                    
                    {vtc.website && (
                      <a 
                        href={vtc.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 p-3 bg-black rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <Globe className="w-5 h-5 text-green-500" />
                        <span className="text-white">Website</span>
                        <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                      </a>
                    )}
                  </div>
                </div>

                {/* VTC Information */}
                <div className="bg-zinc-900 rounded-xl p-6 border-2 border-white/10">
                  <h2 className="text-2xl font-bold text-white mb-6">VTC Information</h2>
                  <div className="space-y-4">
                    <div>
                      <div className="text-gray-400 text-sm">VTC ID</div>
                      <div className="text-white font-medium">#{vtc.id}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Owner</div>
                      <div className="text-white font-medium hover:text-red-400"><Link href={`/players/${vtc.owner_id}`}>{vtc.owner_username}</Link></div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Tag</div>
                      <div className="text-white font-medium">[{vtc.tag}]</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Founded</div>
                      <div className="text-white font-medium">
                        {new Date(vtc.created).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Status</div>
                      <div className="flex items-center space-x-2">
                        {vtc.verified && (
                          <Badge className="bg-blue-500 text-white">
                            <Shield className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {vtc.validated && (
                          <Badge className="bg-green-500 text-white">
                            Validated
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer/>
    </div>
  );
}