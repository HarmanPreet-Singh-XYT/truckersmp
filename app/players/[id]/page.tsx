'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navigation } from '@/components/ui/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TruckersAPI } from '@/lib/api';
import { Player, Ban, Event } from '@/types/api';
import { 
  User, 
  Shield, 
  Calendar,
  Trophy,
  Award,
  Building2,
  ExternalLink,
  ArrowLeft,
  Crown,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  DollarSign,
  Eye,
  EyeOff,
  Hash,
  Gamepad2
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Footer from '@/components/footer';

export default function PlayerDetailPage() {
  const params = useParams();
  const [player, setPlayer] = useState<Player | null>(null);
  const [bans, setBans] = useState<Ban[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const playerId = parseInt(params.id as string);
        if (isNaN(playerId)) {
          throw new Error('Invalid player ID');
        }
        
        const [playerData, bansData, eventsData] = await Promise.all([
          TruckersAPI.getPlayer(playerId),
          TruckersAPI.getPlayerBans(playerId).catch(() => ({ response: [] })),
          TruckersAPI.getPlayerEvents(playerId).catch(() => ({ response: [] }))
        ]);
        
        setPlayer(playerData.response);
        setBans(bansData.response || []);
        setEvents(eventsData.response || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load player');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading Player Profile...</div>
        </div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="pt-24 pb-12 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-red-400 text-xl mb-4">{error || 'Player not found'}</div>
            <Link href="/search">
              <Button className="bg-red-500 hover:bg-red-600">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Search
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeBans = bans.filter(ban => ban.active);
  
  // Format currency
  const formatCents = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-black">
        <Navigation />
        
        <div className="pt-24 pb-12 px-6">
          <div className="max-w-7xl mx-auto">
            {/* Back Button */}
            <div className="mb-8">
              <Link href="/search">
                <Button variant="outline" className="border-white/10 hover:text-white hover:bg-white/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Search
                </Button>
              </Link>
            </div>

            {/* Player Header */}
            <div className="bg-zinc-900 rounded-xl p-8 border-2 border-white/10 mb-8">
              <div className="flex items-start space-x-6">
                <div className="relative">
                  <img 
                    src={player.avatar} 
                    alt={player.name}
                    className="w-32 h-32 rounded-xl border-2 border-white/10"
                  />
                  {/* Small Avatar for comparison */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <img 
                        src={player.smallAvatar} 
                        alt={`${player.name} small`}
                        className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-2 border-zinc-900"
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Small avatar (32x32)</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    {player.banned && (
                      <Badge variant="destructive" className="text-lg px-3 py-1">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        BANNED
                      </Badge>
                    )}
                    {player.bannedUntil && player.banned && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="text-sm border-red-500 text-red-400">
                            <Clock className="w-3 h-3 mr-1" />
                            {format(new Date(player.bannedUntil), 'MMM dd, yyyy')}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Ban expires on this date (deprecated field)</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {player.permissions.isStaff && (
                      <Badge className="bg-blue-500 text-white">
                        <Shield className="w-4 h-4 mr-1" />
                        Staff
                      </Badge>
                    )}
                    {player.permissions.isUpperStaff && (
                      <Badge className="bg-purple-500 text-white">
                        <Crown className="w-4 h-4 mr-1" />
                        Upper Staff
                      </Badge>
                    )}
                    {player.permissions.isGameAdmin && (
                      <Badge className="bg-red-600 text-white">
                        <Gamepad2 className="w-4 h-4 mr-1" />
                        Game Admin
                      </Badge>
                    )}
                    {player.patreon.isPatron && (
                      <Badge 
                        className="text-white"
                        style={{ backgroundColor: player.patreon.color || '#FF6B6B' }}
                      >
                        <Crown className="w-4 h-4 mr-1" />
                        Patreon {player.patreon.hidden && '(Hidden)'}
                      </Badge>
                    )}
                  </div>
                  
                  <h1 className="text-5xl font-bold text-white mb-4">{player.name}</h1>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                    <div>
                      <div className="text-gray-400">Player ID</div>
                      <div className="text-white font-medium">#{player.id}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Group</div>
                      <div className="flex items-center space-x-2">
                        <span 
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{ backgroundColor: player.groupColor, color: '#fff' }}
                        >
                          {player.groupName}
                        </span>
                        <span className="text-gray-500 text-xs">(ID: {player.groupID})</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">Steam ID</div>
                      <div className="text-white font-medium">{player.steamID}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 flex items-center space-x-1">
                        <span>Bans</span>
                        {player.displayBans ? (
                          <Eye className="w-3 h-3" />
                        ) : (
                          <EyeOff className="w-3 h-3" />
                        )}
                      </div>
                      <div className="text-white font-medium">
                        {player.bansCount !== null ? player.bansCount : 'Private'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mt-4 text-sm">
                    <div className="text-gray-400">
                      Joined: {format(new Date(player.joinDate), 'MMMM dd, yyyy')} 
                      <span className="text-gray-500 ml-1">({formatDistanceToNow(new Date(player.joinDate), { addSuffix: true })})</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Bans Warning */}
            {activeBans.length > 0 && (
              <div className="bg-red-500/20 border-2 border-red-500/50 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-bold text-red-400 mb-3 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Active Bans ({activeBans.length})
                </h3>
                <div className="space-y-3">
                  {activeBans.map((ban, index) => (
                    <div key={index} className="bg-black/50 rounded-lg p-4">
                      <div className="text-white font-medium mb-2">{ban.reason}</div>
                      <div className="flex items-center justify-between">
                        <div className="text-gray-400 text-sm">
                          by {ban.adminName} (ID: {ban.adminID}) • 
                          Added {format(new Date(ban.timeAdded), 'MMM dd, yyyy HH:mm')}
                        </div>
                        <div className="text-sm">
                          {ban.expiration ? (
                            <span className="text-yellow-400">
                              Expires {formatDistanceToNow(new Date(ban.expiration), { addSuffix: true })}
                            </span>
                          ) : (
                            <span className="text-red-400 font-bold">Permanent</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-6 mb-8 bg-zinc-900">
                <TabsTrigger value="overview" className="data-[state=active]:bg-red-500">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="vtc" className="data-[state=active]:bg-red-500">
                  VTC {player.displayVTCHistory ? '' : '🔒'}
                </TabsTrigger>
                <TabsTrigger value="achievements" className="data-[state=active]:bg-red-500">
                  Achievements ({player.achievements.length})
                </TabsTrigger>
                <TabsTrigger value="awards" className="data-[state=active]:bg-red-500">
                  Awards ({player.awards.length})
                </TabsTrigger>
                <TabsTrigger value="bans" className="data-[state=active]:bg-red-500">
                  Bans {player.displayBans ? `(${bans.length})` : '🔒'}
                </TabsTrigger>
                <TabsTrigger value="events" className="data-[state=active]:bg-red-500">
                  Events ({events.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    {/* Player Stats */}
                    <div className="bg-zinc-900 rounded-xl p-6 border-2 border-white/10">
                      <h2 className="text-2xl font-bold text-white mb-6">Player Statistics</h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-white">{player.achievements.length}</div>
                          <div className="text-gray-400">Achievements</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-white">{player.awards.length}</div>
                          <div className="text-gray-400">Awards</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-white">
                            {player.bansCount !== null ? player.bansCount : '?'}
                          </div>
                          <div className="text-gray-400">Total Bans</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-white">{events.length}</div>
                          <div className="text-gray-400">Events</div>
                        </div>
                      </div>
                    </div>

                                        {/* Recent Achievements */}
                    {player.achievements.length > 0 && (
                      <div className="bg-zinc-900 rounded-xl p-6 border-2 border-white/10">
                        <h2 className="text-2xl font-bold text-white mb-6">Recent Achievements</h2>
                        <div className="space-y-4">
                          {player.achievements.slice(0, 3).map((achievement) => (
                            <div key={achievement.id} className="flex items-center space-x-4 p-4 bg-black rounded-lg">
                              <img 
                                src={achievement.image_url} 
                                alt={achievement.title}
                                className="w-16 h-16 rounded-lg"
                              />
                              <div className="flex-1">
                                <h3 className="text-white font-medium">{achievement.title}</h3>
                                <p className="text-gray-400 text-sm">{achievement.description}</p>
                                <div className="text-gray-500 text-xs mt-1">
                                  {format(new Date(achievement.achieved_at), 'MMM dd, yyyy HH:mm')} • {formatDistanceToNow(new Date(achievement.achieved_at), { addSuffix: true })}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-8">
                    {/* Patreon Info */}
                    {player.patreon.isPatron && !player.patreon.hidden && (
                      <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-6 border-2" 
                           style={{ borderColor: player.patreon.color || '#FF6B6B' }}>
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                          <Crown className="w-5 h-5 mr-2" style={{ color: player.patreon.color || '#FF6B6B' }} />
                          Patreon Supporter
                        </h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-300">Status</span>
                            <Badge variant={player.patreon.active ? "default" : "secondary"}>
                              {player.patreon.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Tier</span>
                            <span className="text-white">Tier {player.patreon.tierId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Current Pledge</span>
                            <span className="text-white">{formatCents(player.patreon.currentPledge)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Next Pledge</span>
                            <span className="text-white">{formatCents(player.patreon.nextPledge)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Lifetime</span>
                            <span className="text-white font-bold">{formatCents(player.patreon.lifetimePledge)}</span>
                          </div>
                        </div>
                        <div 
                          className="mt-4 h-2 rounded-full overflow-hidden"
                          style={{ backgroundColor: player.patreon.color + '40' }}
                        >
                          <div 
                            className="h-full rounded-full"
                            style={{ backgroundColor: player.patreon.color || '#FF6B6B' }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Hidden Patreon Notice */}
                    {player.patreon.isPatron && player.patreon.hidden && (
                      <div className="bg-zinc-900 rounded-xl p-6 border-2 border-white/10">
                        <div className="flex items-center space-x-2 text-gray-400">
                          <EyeOff className="w-5 h-5" />
                          <span>Patreon information is hidden</span>
                        </div>
                      </div>
                    )}

                    {/* Account Info */}
                    <div className="bg-zinc-900 rounded-xl p-6 border-2 border-white/10">
                      <h3 className="text-xl font-bold text-white mb-4">Account Information</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Steam ID64</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-white font-mono cursor-help">{player.steamID64}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>64-bit Steam ID</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Steam ID</span>
                          <span className="text-white font-mono">{player.steamID}</span>
                        </div>
                        {player.discordSnowflake && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Discord ID</span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-white font-mono cursor-help">{player.discordSnowflake}</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Discord Snowflake ID</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-400">Join Date</span>
                          <span className="text-white">
                            {format(new Date(player.joinDate), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Account Age</span>
                          <span className="text-white">
                            {formatDistanceToNow(new Date(player.joinDate))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Display Bans</span>
                          <span className="text-white flex items-center">
                            {player.displayBans ? (
                              <Eye className="w-4 h-4 text-green-500" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-red-500" />
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">VTC History</span>
                          <span className="text-white flex items-center">
                            {player.displayVTCHistory ? (
                              <Eye className="w-4 h-4 text-green-500" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-red-500" />
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Permissions */}
                    <div className="bg-zinc-900 rounded-xl p-6 border-2 border-white/10">
                      <h3 className="text-xl font-bold text-white mb-4">Permissions</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Staff Member</span>
                          {player.permissions.isStaff ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-600"></div>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Upper Staff</span>
                          {player.permissions.isUpperStaff ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-600"></div>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Game Admin</span>
                          {player.permissions.isGameAdmin ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-600"></div>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-gray-400 cursor-help">Web Maps Detail</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Shows detailed information on web maps</p>
                            </TooltipContent>
                          </Tooltip>
                          {player.permissions.showDetailedOnWebMaps ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-600"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="vtc">
                <div className="space-y-8">
                  {/* Privacy Notice */}
                  {player.vtcHistory != null && !player.displayVTCHistory && player.vtcHistory!.length > 0 && (
                    <div className="bg-yellow-500/20 border-2 border-yellow-500/50 rounded-xl p-4">
                      <div className="flex items-center space-x-2 text-yellow-400">
                        <EyeOff className="w-5 h-5" />
                        <span>VTC history is set to private by the player</span>
                      </div>
                    </div>
                  )}

                  {/* Current VTC */}
                  {player.vtc.inVTC && (
                    <div className="bg-zinc-900 rounded-xl p-6 border-2 border-white/10">
                      <h2 className="text-2xl font-bold text-white mb-6">Current VTC</h2>
                      <div className="flex items-center space-x-4 p-4 bg-black rounded-lg">
                        <Building2 className="w-12 h-12 text-blue-500" />
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white">
                            {player.vtc.name} 
                            <span className="text-gray-400 font-normal ml-2">[{player.vtc.tag}]</span>
                          </h3>
                          <div className="flex items-center space-x-4 text-gray-400">
                            <span>VTC ID: #{player.vtc.id}</span>
                            <span>Member ID: #{player.vtc.memberID}</span>
                          </div>
                        </div>
                        <Link href={`/vtcs/${player.vtc.id}`}>
                          <Button className="bg-red-500 hover:bg-red-600">
                            View VTC
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* VTC History */}
                  {player.vtcHistory != null && player.vtcHistory!.length > 0 && player.displayVTCHistory && (
                    <div className="bg-zinc-900 rounded-xl p-6 border-2 border-white/10">
                      <h2 className="text-2xl font-bold text-white mb-6">VTC History ({player.vtcHistory != null  ? player.vtcHistory!.length : 0})</h2>
                      <div className="space-y-4">
                        {player.vtcHistory!.map((vtc) => (
                          <div key={vtc.id} className="flex items-center justify-between p-4 bg-black rounded-lg">
                            <div className="flex items-center space-x-4">
                              <Building2 className="w-8 h-8 text-gray-400" />
                              <div>
                                <div className="flex items-center space-x-2">
                                  <Link href={`/vtcs/${vtc.id}`} className="text-white font-medium hover:text-red-400 transition-colors">
                                    {vtc.name}
                                  </Link>
                                  {vtc.verified && (
                                    <Badge variant="outline" className="text-xs">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-gray-400 text-sm mt-1">
                                  <span className="flex items-center space-x-4">
                                    <span>
                                      Joined: {format(new Date(vtc.joinDate), 'MMM dd, yyyy')}
                                    </span>
                                    {vtc.leftDate && (
                                      <span>
                                        Left: {format(new Date(vtc.leftDate), 'MMM dd, yyyy')}
                                      </span>
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {vtc.leftDate && (
                              <div className="text-gray-400 text-sm text-right">
                                <div>Duration:</div>
                                <div className="text-white">
                                  {formatDistanceToNow(new Date(vtc.joinDate), { 
                                    addSuffix: false,
                                    includeSeconds: false
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {player.vtcHistory != null && !player.vtc.inVTC && player.vtcHistory!.length === 0 && (
                    <div className="bg-zinc-900 rounded-xl p-12 border-2 border-white/10 text-center">
                      <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <div className="text-gray-400 text-xl">No VTC information available</div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="achievements">
                <div className="bg-zinc-900 rounded-xl p-6 border-2 border-white/10">
                  <h2 className="text-2xl font-bold text-white mb-6">Achievements ({player.achievements.length})</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {player.achievements.map((achievement) => (
                      <div key={achievement.id} className="flex items-center space-x-4 p-4 bg-black rounded-lg hover:bg-black/70 transition-colors">
                        <img 
                          src={achievement.image_url} 
                          alt={achievement.title}
                          className="w-16 h-16 rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{achievement.title}</h3>
                          <p className="text-gray-400 text-sm">{achievement.description}</p>
                          <div className="text-gray-500 text-xs mt-1">
                            <Hash className="w-3 h-3 inline mr-1" />
                            {achievement.id} • {format(new Date(achievement.achieved_at), 'MMM dd, yyyy HH:mm')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                                    {player.achievements.length === 0 && (
                    <div className="text-center py-12">
                      <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <div className="text-gray-400 text-xl">No achievements earned yet</div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="awards">
                <div className="bg-zinc-900 rounded-xl p-6 border-2 border-white/10">
                  <h2 className="text-2xl font-bold text-white mb-6">Awards ({player.awards.length})</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {player.awards.map((award) => (
                      <div key={award.id} className="bg-black rounded-lg p-4 hover:bg-black/70 transition-colors">
                        <div className="flex flex-col items-center text-center">
                          <img 
                            src={award.image_url} 
                            alt={award.name}
                            className="w-24 h-24 rounded-lg mb-3"
                          />
                          <h3 className="text-white font-medium mb-1">{award.name}</h3>
                          <div className="text-gray-500 text-xs">
                            <Hash className="w-3 h-3 inline mr-1" />
                            {award.id}
                          </div>
                          <div className="text-gray-400 text-sm mt-2">
                            {format(new Date(award.awarded_at), 'MMM dd, yyyy')}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {formatDistanceToNow(new Date(award.awarded_at), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {player.awards.length === 0 && (
                    <div className="text-center py-12">
                      <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <div className="text-gray-400 text-xl">No awards received yet</div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="bans">
                {player.displayBans ? (
                  <div className="bg-zinc-900 rounded-xl p-6 border-2 border-white/10">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-white">Ban History ({bans.length})</h2>
                      <div className="flex items-center space-x-4 text-sm">
                        <Badge variant="destructive">
                          Active: {activeBans.length}
                        </Badge>
                        <Badge variant="secondary">
                          Expired: {bans.length - activeBans.length}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {bans.map((ban, index) => (
                        <div key={index} className={`rounded-lg p-4 border-2 ${
                          ban.active 
                            ? 'bg-red-900/20 border-red-500/50' 
                            : 'bg-black border-white/10'
                        }`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <Badge variant={ban.active ? "destructive" : "secondary"}>
                                {ban.active ? 'Active Ban' : 'Expired'}
                              </Badge>
                              {!ban.expiration && ban.active && (
                                <Badge variant="outline" className="border-red-500 text-red-500">
                                  Permanent
                                </Badge>
                              )}
                            </div>
                            <div className="text-gray-400 text-sm">
                              by <span className="text-white">{ban.adminName}</span> 
                              <span className="text-gray-500 ml-1">(ID: {ban.adminID})</span>
                            </div>
                          </div>
                          <div className="text-white font-medium mb-2">{ban.reason}</div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Issued:</span>
                              <div className="text-white">
                                {format(new Date(ban.timeAdded), 'MMM dd, yyyy HH:mm')}
                              </div>
                              <div className="text-gray-500 text-xs">
                                {formatDistanceToNow(new Date(ban.timeAdded), { addSuffix: true })}
                              </div>
                            </div>
                            {ban.expiration && (
                              <div>
                                <span className="text-gray-400">
                                  {ban.active ? 'Expires:' : 'Expired:'}
                                </span>
                                <div className="text-white">
                                  {format(new Date(ban.expiration), 'MMM dd, yyyy HH:mm')}
                                </div>
                                <div className={`text-xs ${ban.active ? 'text-yellow-500' : 'text-gray-500'}`}>
                                  {formatDistanceToNow(new Date(ban.expiration), { addSuffix: true })}
                                </div>
                              </div>
                            )}
                            {ban.expiration && (
                              <div>
                                <span className="text-gray-400">Duration:</span>
                                <div className="text-white">
                                  {(() => {
                                    const start = new Date(ban.timeAdded);
                                    const end = new Date(ban.expiration);
                                    const days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                                    return `${days} days`;
                                  })()}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {bans.length === 0 && (
                      <div className="text-center py-12">
                        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                        <div className="text-gray-400 text-xl">Clean record - no bans</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-zinc-900 rounded-xl p-12 border-2 border-white/10 text-center">
                    <EyeOff className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <div className="text-gray-400 text-xl mb-2">Ban history is private</div>
                    <div className="text-gray-500">This player has chosen to hide their ban history</div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="events">
                <div className="space-y-6">
                  {events.length > 0 && (
                    <div className="bg-zinc-900 rounded-xl p-6 border-2 border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-white">Events Attended ({events.length})</h2>
                        <div className="text-gray-400 text-sm">
                          Click on an event to view details
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {events.map((event) => (
                    <Link key={event.id} href={`/events/${event.id}`}>
                      <div className="bg-zinc-900 rounded-xl p-6 border-2 border-white/10 hover:border-red-500/50 transition-all cursor-pointer group">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors">
                                {event.name}
                              </h3>
                              <Badge className="bg-red-500 text-white">
                                {event.event_type.name}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2 text-gray-400">
                                  <MapPin className="w-4 h-4" />
                                  <span>
                                    {event.departure.city} ({event.departure.location}) 
                                    → 
                                    {event.arrive.city} ({event.arrive.location})
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 text-gray-400">
                                  <Calendar className="w-4 h-4" />
                                  <span>{format(new Date(event.start_at), 'MMMM dd, yyyy')}</span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2 text-gray-400">
                                  <Clock className="w-4 h-4" />
                                  <span>{format(new Date(event.start_at), 'HH:mm')} UTC</span>
                                </div>
                                <div className="flex items-center space-x-2 text-gray-400">
                                  <User className="w-4 h-4" />
                                  <span>{event.attendances.confirmed} attendees</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors" />
                        </div>
                        
                        {/* Event Status */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                          <div className="flex items-center space-x-4">
                            {event.server && (
                              <Badge variant="outline">
                                Server: {event.server.name}
                              </Badge>
                            )}
                            {/* {event.dlcs && event.dlcs.length > 0 && ( */}
                              <Badge variant="outline">
                                DLCs Required: {event.dlcs.dlc_id}
                              </Badge>
                            {/* )} */}
                          </div>
                          <div className="text-gray-500 text-sm">
                            Event ID: #{event.id}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                  
                  {events.length === 0 && (
                    <div className="bg-zinc-900 rounded-xl p-12 border-2 border-white/10 text-center">
                      <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <div className="text-gray-400 text-xl">No events attended</div>
                      <div className="text-gray-500 mt-2">This player hasnt attended any events yet</div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <Footer/>
      </div>
    </TooltipProvider>
  );
}