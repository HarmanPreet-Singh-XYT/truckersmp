'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/ui/navigation';
import { TruckersAPI } from '@/lib/api';
import { Player, Ban, VTC, VTCMember, VTCNews } from '@/types/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Search, 
  User, 
  Shield, 
  Calendar, 
  Trophy, 
  MapPin, 
  AlertCircle,
  Building2,
  Ban as BanIcon,
  Clock,
  DollarSign,
  Hash,
  ExternalLink,
  Users,
  Globe,
  Newspaper,
  Crown,
  Pin
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Footer from '@/components/footer';

// Sub-components for better organization
const PlayerProfileCard = ({ player }: { player: Player }) => {
  const router = useRouter();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-zinc-900 border-white/10 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <motion.img 
              src={player.avatar} 
              alt={player.name}
              className="w-24 h-24 rounded-xl shadow-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            <div className="flex-1 w-full">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Link href={`/players/${player.id}`}>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white hover:text-red-400 transition-colors cursor-pointer">
                    {player.name}
                  </h2>
                </Link>
                <div className="flex flex-wrap gap-2">
                  {player.banned && (
                    <Badge variant="destructive" className="animate-pulse">
                      <BanIcon className="w-3 h-3 mr-1" />
                      BANNED
                    </Badge>
                  )}
                  {player.permissions.isStaff && (
                    <Badge className="bg-blue-500 text-white">
                      <Shield className="w-3 h-3 mr-1" />
                      Staff
                    </Badge>
                  )}
                  {player.groupName && (
                    <Badge 
                      style={{ backgroundColor: player.groupColor }}
                      className="text-white"
                    >
                      {player.groupName}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <Button 
                  onClick={() => router.push(`/players/${player.id}`)}
                  className="bg-red-500 hover:bg-red-600 transition-all hover:scale-105"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Full Profile
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <InfoItem icon={<Hash />} label="Player ID" value={player.id.toString()} />
                <InfoItem 
                  icon={<Calendar />} 
                  label="Joined" 
                  value={formatDistanceToNow(new Date(player.joinDate), { addSuffix: true })} 
                />
                <InfoItem icon={<User />} label="Steam ID" value={player.steamID} />
                {player.vtc.inVTC && (
                  <InfoItem 
                    icon={<Building2 />} 
                    label="VTC" 
                    value={`${player.vtc.name} [${player.vtc.tag}]`} 
                  />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const VTCProfileCard = ({ vtc, members, news }: { vtc: VTC; members: VTCMember[]; news: VTCNews[] }) => {
  const router = useRouter();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-zinc-900 border-white/10 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {vtc.logo && (
              <motion.img 
                src={vtc.logo} 
                alt={vtc.name}
                className="w-24 h-24 rounded-xl shadow-lg border-2 border-white/10"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            )}
            <div className="flex-1 w-full">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Link href={`/vtcs/${vtc.id}`}>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white hover:text-red-400 transition-colors cursor-pointer">
                    {vtc.name}
                  </h2>
                </Link>
                <div className="flex flex-wrap gap-2">
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
              </div>
              
              {vtc.slogan && (
                <p className="text-gray-300 mb-4">{vtc.slogan}</p>
              )}
              
              <div className="mb-6">
                <Button 
                  onClick={() => router.push(`/vtcs/${vtc.id}`)}
                  className="bg-red-500 hover:bg-red-600 transition-all hover:scale-105"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Full Profile
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <InfoItem icon={<Hash />} label="VTC ID" value={vtc.id.toString()} />
                <InfoItem icon={<Users />} label="Members" value={vtc.members_count.toString()} />
                <InfoItem icon={<User />} label="Owner" value={vtc.owner_username} />
                <InfoItem icon={<Globe />} label="Language" value={vtc.language} />
                <InfoItem 
                  icon={<Calendar />} 
                  label="Founded" 
                  value={formatDistanceToNow(new Date(vtc.created), { addSuffix: true })} 
                />
                <InfoItem icon={<Newspaper />} label="News Articles" value={news.length.toString()} />
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {vtc.games.ets && (
                  <Badge className="bg-blue-600 text-white">ETS2</Badge>
                )}
                {vtc.games.ats && (
                  <Badge className="bg-orange-600 text-white">ATS</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const VTCMembersSection = ({ members }: { members: VTCMember[] }) => {
  if (members.length === 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className="bg-zinc-900 border-white/10">
        <CardHeader>
          <CardTitle className="flex text-gray-300 items-center gap-2">
            <Users className="w-5 h-5" />
            Members ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.slice(0, 8).map((member) => (
              <div key={member.id} className="flex items-center space-x-3 p-3 bg-black/50 rounded-lg">
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
            ))}
          </div>
          {members.length > 8 && (
            <div className="text-center mt-4 text-gray-400">
              And {members.length - 8} more members...
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const VTCNewsSection = ({ news, vtc }: { news: VTCNews[]; vtc: VTC }) => {
  if (news.length === 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card className="bg-zinc-900 border-white/10">
        <CardHeader>
          <CardTitle className="flex text-gray-300 items-center gap-2">
            <Newspaper className="w-5 h-5" />
            Latest News ({news.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 grid">
            {news.slice(0, 5).map((article) => (
              <Link key={article.id} href={`/news/${vtc.id}/${article.id}`}>
                <div className="p-4 bg-black/50 rounded-lg hover:bg-black/70 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-white line-clamp-2 flex-1">{article.title}</h4>
                    {article.pinned && (
                      <Pin className="w-4 h-4 text-yellow-500 ml-2 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-2">{article.content_summary}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>by {article.author}</span>
                    <span>{formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {news.length > 5 && (
            <div className="text-center mt-4">
              <Link href={`/vtcs/${vtc.id}`}>
                <Button variant="outline" className="border-white/10 hover:text-white hover:bg-white/10">
                  View All News
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center gap-2 text-gray-300">
    <span className="text-gray-400">{icon}</span>
    <span className="text-gray-400">{label}:</span>
    <span className="font-medium">{value}</span>
  </div>
);

const VTCSection = ({ player }: { player: Player }) => {
  if (!player.vtc.inVTC) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className="bg-zinc-900 border-white/10">
        <CardHeader>
          <CardTitle className="flex text-gray-300 items-center gap-2">
            <Building2 className="w-5 h-5" />
            Virtual Trucking Company
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Link href={`/vtcs/${player.vtc.id}`}><h3 className="text-lg hover:text-red-400 font-semibold text-white">{player.vtc.name}</h3></Link>
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              <span>Tag: [{player.vtc.tag}]</span>
              <span>Member ID: #{player.vtc.memberID}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const PatreonSection = ({ player }: { player: Player }) => {
  if (!player.patreon.isPatron) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-orange-500" />
            Patreon Supporter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <InfoCard label="Tier" value={`Tier ${player.patreon.tierId}`} />
            <InfoCard 
              label="Status" 
              value={player.patreon.active ? 'Active' : 'Inactive'}
              valueClassName={player.patreon.active ? 'text-green-400' : 'text-gray-400'}
            />
            <InfoCard label="Current Pledge" value={`$${player.patreon.currentPledge}`} />
            <InfoCard label="Lifetime Support" value={`$${player.patreon.lifetimePledge}`} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const InfoCard = ({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) => (
  <div className="bg-black/40 rounded-lg p-3">
    <div className="text-xs text-gray-200 mb-1">{label}</div>
    <div className={cn("font-semibold", valueClassName || "text-white")}>{value}</div>
  </div>
);

const AchievementsSection = ({ achievements }: { achievements: Player['achievements'] }) => {
  if (achievements.length === 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <Card className="bg-zinc-900 border-white/10">
        <CardHeader>
          <CardTitle className="flex text-gray-300 items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Achievements ({achievements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="flex items-start gap-3 p-4 bg-black/50 rounded-lg hover:bg-black/70 transition-colors"
              >
                <img 
                  src={achievement.image_url} 
                  alt={achievement.title}
                  className="w-12 h-12 rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white truncate">{achievement.title}</h4>
                  <p className="text-sm text-gray-400 line-clamp-2">{achievement.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {formatDistanceToNow(new Date(achievement.achieved_at), { addSuffix: true })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const BanHistorySection = ({ bans }: { bans: Ban[] }) => {
  if (bans.length === 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      <Card className="bg-red-500/10 border-red-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <BanIcon className="w-5 h-5" />
            Ban History ({bans.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bans.map((ban, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="bg-black/50 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={ban.active ? "destructive" : "secondary"}>
                    {ban.active ? 'Active Ban' : 'Expired'}
                  </Badge>
                  <span className="text-sm text-gray-400">by {ban.adminName}</span>
                </div>
                <p className="text-white font-medium mb-2">{ban.reason}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                  <span>
                    <Clock className="w-3 h-3 inline mr-1" />
                    Added: {formatDistanceToNow(new Date(ban.timeAdded), { addSuffix: true })}
                  </span>
                  {ban.expiration && (
                    <span>
                      <Clock className="w-3 h-3 inline mr-1" />
                      Expires: {formatDistanceToNow(new Date(ban.expiration), { addSuffix: true })}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const LoadingSkeleton = () => (
  <div className="space-y-8">
    <Card className="bg-zinc-900 border-white/10">
      <CardContent className="p-6">
        <div className="flex items-start gap-6">
          <Skeleton className="w-24 h-24 rounded-xl" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default function SearchPage() {
  const [searchType, setSearchType] = useState<'player' | 'vtc'>('player');
  const [searchTerm, setSearchTerm] = useState('');
  const [player, setPlayer] = useState<Player | null>(null);
  const [bans, setBans] = useState<Ban[]>([]);
  const [vtc, setVTC] = useState<VTC | null>(null);
  const [vtcMembers, setVTCMembers] = useState<VTCMember[]>([]);
  const [vtcNews, setVTCNews] = useState<VTCNews[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateSearchTerm = useCallback((term: string, type: 'player' | 'vtc'): { valid: boolean; error?: string } => {
    if (!term.trim()) {
      return { valid: false, error: `Please enter a ${type} ID` };
    }
    
    const id = parseInt(term);
    if (isNaN(id)) {
      return { valid: false, error: `${type === 'player' ? 'Player' : 'VTC'} ID must be a number` };
    }
    
    if (id < 1) {
      return { valid: false, error: `${type === 'player' ? 'Player' : 'VTC'} ID must be positive` };
    }
    
    return { valid: true };
  }, []);

  const performSearch = useCallback(async () => {
    const validation = validateSearchTerm(searchTerm, searchType);
    if (!validation.valid) {
      setError(validation.error || 'Invalid search term');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    // Clear previous results
    setPlayer(null);
    setBans([]);
    setVTC(null);
    setVTCMembers([]);
    setVTCNews([]);
    
    try {
      const id = parseInt(searchTerm);
      
      if (searchType === 'player') {
        const [playerData, bansData] = await Promise.all([
          TruckersAPI.getPlayer(id),
          TruckersAPI.getPlayerBans(id)
        ]);
        
        setPlayer(playerData.response);
        setBans(bansData.response || []);
      } else {
        const [vtcData, membersData, newsData] = await Promise.all([
          TruckersAPI.getVTC(id),
          TruckersAPI.getVTCMembers(id).catch(() => ({ response: { members: [] } })),
          TruckersAPI.getVTCNews(id).catch(() => ({ response: { news: [] } }))
        ]);
        
        setVTC(vtcData.response);
        setVTCMembers(membersData.response?.members || []);
        setVTCNews(newsData.response?.news || []);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to find player';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, searchType, validateSearchTerm]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      performSearch();
    }
  }, [performSearch, loading]);

  const handleClear = useCallback(() => {
    setSearchTerm('');
    setPlayer(null);
    setBans([]);
    setVTC(null);
    setVTCMembers([]);
    setVTCNews([]);
    setError(null);
  }, []);

  const recentSearches = useMemo(() => {
    // You could implement localStorage to save recent searches
    return [];
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      <div className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              {searchType === 'player' ? 'Player Search' : 'VTC Search'}
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
              {searchType === 'player' 
                ? 'Search for player profiles, statistics, and ban history by player ID.'
                : 'Search for VTC profiles, members, and news by VTC ID.'
              }
            </p>
          </motion.div>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="bg-zinc-900 border-2 border-white/10 mb-8">
              <CardContent className="p-6">
                {/* Search Type Toggle */}
                <div className="flex justify-center mb-6">
                  <div className="bg-black rounded-lg p-1 flex">
                    <button
                      onClick={() => {
                        setSearchType('player');
                        handleClear();
                      }}
                      className={`px-6 py-2 rounded-md font-medium transition-colors ${
                        searchType === 'player'
                          ? 'bg-red-500 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <User className="w-4 h-4 mr-2 inline" />
                      Player Search
                    </button>
                    <button
                      onClick={() => {
                        setSearchType('vtc');
                        handleClear();
                      }}
                      className={`px-6 py-2 rounded-md font-medium transition-colors ${
                        searchType === 'vtc'
                          ? 'bg-red-500 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Building2 className="w-4 h-4 mr-2 inline" />
                      VTC Search
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder={searchType === 'player' ? 'Enter player ID (e.g. 123456)' : 'Enter VTC ID (e.g. 1234)'}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pl-10 bg-black border-white/10 text-white focus:border-red-500 transition-colors"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={performSearch} 
                      disabled={loading}
                      className="bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-all hover:scale-105"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Search
                        </>
                      )}
                    </Button>
                    {(searchTerm || player || vtc) && (
                      <Button
                        onClick={handleClear}
                        variant="outline"
                        className="border-white/10 hover:bg-white/10"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Quick Tips */}
                <div className="mt-4 text-sm text-gray-400">
                  <p>💡 Tip: You can find {searchType === 'player' ? 'player' : 'VTC'} IDs from their TruckersMP profile URL</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Error State */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Alert className="bg-red-500/20 border-red-500/50 mb-8">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Search Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading State */}
          {loading && <LoadingSkeleton />}

          {/* Results */}
          <AnimatePresence mode="wait">
            {(player || vtc) && !loading && (
              <motion.div
                key={player?.id || vtc?.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {player && (
                  <>
                    <PlayerProfileCard player={player} />
                    <VTCSection player={player} />
                    <PatreonSection player={player} />
                    <AchievementsSection achievements={player.achievements} />
                    <BanHistorySection bans={bans} />
                  </>
                )}
                
                {vtc && (
                  <>
                    <VTCProfileCard vtc={vtc} members={vtcMembers} news={vtcNews} />
                    <VTCMembersSection members={vtcMembers} />
                    <VTCNewsSection news={vtcNews} vtc={vtc} />
                  </>
                )}
                
                {/* VTC History */}
                {player && player.vtcHistory != null && player.vtcHistory.length > 0 && player.displayVTCHistory && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                  >
                    <Card className="bg-zinc-900 border-white/10">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="w-5 h-5" />
                          VTC History
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {player.vtcHistory.map((vtc, index) => (
                            <motion.div
                              key={vtc.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2, delay: index * 0.05 }}
                              className="flex items-center justify-between p-4 bg-black/50 rounded-lg hover:bg-black/70 transition-colors"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-white">{vtc.name}</span>
                                  {vtc.verified && (
                                    <Badge variant="outline" className="text-xs">
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-gray-400 mt-1">
                                  Joined: {formatDistanceToNow(new Date(vtc.joinDate), { addSuffix: true })}
                                </div>
                              </div>
                              {vtc.leftDate && (
                                <div className="text-sm text-gray-400">
                                  Left: {formatDistanceToNow(new Date(vtc.leftDate), { addSuffix: true })}
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State */}
          {!player && !vtc && !loading && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-zinc-900 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No search yet</h3>
              <p className="text-gray-400">
                Enter a {searchType === 'player' ? 'player' : 'VTC'} ID to get started
              </p>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}