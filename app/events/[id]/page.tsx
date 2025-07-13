'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navigation } from '@/components/ui/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TruckersAPI } from '@/lib/api';
import { Event } from '@/types/api';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  ExternalLink, 
  Volume2, 
  Building2,
  User,
  CheckCircle,
  HelpCircle,
  ArrowLeft,
  Globe,
  Hash,
  Gamepad2,
  Languages,
  Shield,
  Star,
  Link as LinkIcon,
  AlertCircle,
  Sparkles,
  CalendarClock,
  Navigation as NavigationIcon
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import Footer from '@/components/footer';

// Helper component for loading skeleton
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-black">
    <Navigation />
    <div className="pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-10 w-32 bg-zinc-800 rounded mb-8"></div>
          <div className="bg-zinc-900 rounded-xl p-8 mb-8">
            <div className="h-8 w-64 bg-zinc-800 rounded mb-4"></div>
            <div className="h-12 w-96 bg-zinc-800 rounded mb-6"></div>
            <div className="flex space-x-4">
              <div className="h-6 w-48 bg-zinc-800 rounded"></div>
              <div className="h-6 w-48 bg-zinc-800 rounded"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-zinc-900 rounded-xl p-6 h-64"></div>
            </div>
            <div>
              <div className="bg-zinc-900 rounded-xl p-6 h-64"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Helper component for info cards
const InfoCard = ({ title, children, icon: Icon, className }: { 
  title: string; 
  children: React.ReactNode; 
  icon?: any;
  className?: string;
}) => (
  <div className={cn("bg-zinc-900 rounded-xl p-6 border-2 border-white/10", className)}>
    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
      {Icon && <Icon className="w-5 h-5 mr-2 text-red-500" />}
      {title}
    </h3>
    {children}
  </div>
);

// Helper component for stat items
const StatItem = ({ icon: Icon, label, value, iconColor = "text-gray-400" }: {
  icon: any;
  label: string;
  value: string | number;
  iconColor?: string;
}) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center space-x-2">
      <Icon className={cn("w-4 h-4", iconColor)} />
      <span className="text-gray-300">{label}</span>
    </div>
    <span className="text-white font-medium">{value}</span>
  </div>
);

// Helper component for location display
const LocationDisplay = ({ title, location }: { title: string; location: any }) => (
  <div>
    <h3 className="text-lg font-medium text-white mb-3">{title}</h3>
    <div className="bg-black rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <MapPin className="w-5 h-5 text-red-500 mt-0.5" />
        <div>
          <div className="text-white font-medium">{location.location}</div>
          <div className="text-gray-400">{location.city}</div>
        </div>
      </div>
    </div>
  </div>
);

// Helper component for time display
const TimeDisplay = ({ title, date, icon: Icon = Clock }: { 
  title: string; 
  date: Date;
  icon?: any;
}) => (
  <div>
    <h3 className="text-lg font-medium text-white mb-3">{title}</h3>
    <div className="bg-black rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <Icon className="w-5 h-5 text-red-500 mt-0.5" />
        <div>
          <div className="text-white font-medium">
            {format(date, 'EEEE, MMMM d, yyyy')}
          </div>
          <div className="text-gray-400">
            {format(date, 'h:mm a')} UTC
          </div>
          <div className="text-gray-500 text-sm mt-1">
            {formatDistanceToNow(date, { addSuffix: true })}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function EventDetailPage() {
  const params = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAttendees, setShowAttendees] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventId = parseInt(params.id as string);
        if (isNaN(eventId)) {
          throw new Error('Invalid event ID');
        }
        
        const data = await TruckersAPI.getEvent(eventId);
        setEvent(data.response);
      } catch (err: any) {
        setError(err.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params.id]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="pt-24 pb-12 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <div className="text-red-400 text-xl mb-4">{error || 'Event not found'}</div>
            <Link href="/events">
              <Button className="bg-red-500 hover:bg-red-600">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Events
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const startDate = new Date(event.start_at);
  const meetupDate = new Date(event.meetup_at);
  const createdDate = new Date(event.created_at);
  const updatedDate = new Date(event.updated_at);

  // Determine event status
  const now = new Date();
  const isUpcoming = startDate > now;
  const isOngoing = startDate <= now && startDate.getTime() + (3 * 60 * 60 * 1000) > now.getTime(); // Assume 3 hour events
  const isPast = !isUpcoming && !isOngoing;

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      <div className="pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <div className="mb-8">
            <Link href="/events">
              <Button variant="outline" className="border-white/10 text-black hover:text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Events
              </Button>
            </Link>
          </div>

          {/* Event Header with Banner */}
          <div className="relative mb-12">
            {event.banner && (
              <div className="absolute inset-0 rounded-xl overflow-hidden">
                <img 
                  src={event.banner} 
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent"></div>
              </div>
            )}
            <div className="relative bg-zinc-900/60 backdrop-blur rounded-xl p-8 border-2 border-white/10">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <Badge className="bg-red-500 text-white">
                      {event.event_type.name}
                    </Badge>
                    {event.featured === "true" && (
                      <Badge className="bg-yellow-500 text-black">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    <Badge variant="outline" className="border-white/20 text-white">
                      <Gamepad2 className="w-3 h-3 mr-1" />
                      {event.game}
                    </Badge>
                    {isOngoing && (
                      <Badge className="bg-green-500 text-white animate-pulse">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Ongoing
                      </Badge>
                    )}
                    {isPast && (
                      <Badge variant="outline" className="border-gray-500 text-gray-400">
                        Ended
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{event.name}</h1>
                  <div className="flex flex-wrap items-center gap-6 text-gray-300">
                    <div className="flex items-center space-x-2">
                      <NavigationIcon className="w-5 h-5 text-red-500" />
                      <span>{event.departure.city} → {event.arrive.city}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-red-500" />
                      <span>{format(startDate, 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-red-500" />
                      <span>{format(startDate, 'h:mm a')} UTC</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Languages className="w-5 h-5 text-red-500" />
                      <span>{event.language}</span>
                    </div>
                  </div>
                </div>
                
                {/* Attendance Stats */}
                <div className="bg-black/50 backdrop-blur rounded-xl p-6 min-w-[220px] hidden lg:block">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-red-500" />
                    Attendance
                  </h3>
                  <div className="space-y-3">
                    <StatItem 
                      icon={CheckCircle}
                      label="Confirmed"
                      value={event.attendances.confirmed}
                      iconColor="text-green-500"
                    />
                    <StatItem 
                      icon={HelpCircle}
                      label="Unsure"
                      value={event.attendances.unsure}
                      iconColor="text-yellow-500"
                    />
                    <StatItem 
                      icon={Building2}
                      label="VTCs"
                      value={event.attendances.vtcs}
                      iconColor="text-blue-500"
                    />
                  </div>
                  {(event.attendances.confirmed_users || event.attendances.unsure_users) && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-4 border-white/20 hover:text-white hover:bg-white/10"
                      onClick={() => setShowAttendees(!showAttendees)}
                    >
                      View Attendees
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Event Details */}
              <InfoCard title="Event Details" icon={Calendar}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <LocationDisplay title="Departure" location={event.departure} />
                  <LocationDisplay title="Destination" location={event.arrive} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TimeDisplay title="Meetup Time" date={meetupDate} icon={Users} />
                  <TimeDisplay title="Start Time" date={startDate} icon={CalendarClock} />
                </div>
              </InfoCard>

              {/* Description */}
              {event.description && (
                <InfoCard title="Description" icon={Globe}>
                  <div 
                    className="text-gray-300 leading-relaxed prose prose-invert max-w-none markdown-body"
                  ><ReactMarkdown>{event.description}</ReactMarkdown></div>
                </InfoCard>
              )}

              {/* Rules */}
              {event.rule && (
                <InfoCard title="Event Rules" icon={Shield}>
                  <div 
                    className="text-gray-300 leading-relaxed prose prose-invert max-w-none markdown-editor"
                  ><ReactMarkdown>{event.rule}</ReactMarkdown></div>
                </InfoCard>
              )}

              {/* Map */}
              {event.map && (
                <InfoCard title="Route Map" icon={MapPin}>
                  <div className="bg-black rounded-lg p-2">
                    <img 
                      src={event.map} 
                      alt="Event Route Map"
                      className="w-full rounded-lg"
                    />
                  </div>
                </InfoCard>
              )}

                            {/* Attendees List (if toggled) */}
              {showAttendees && (event.attendances.confirmed_users || event.attendances.unsure_users) && (
                <InfoCard title="Event Attendees" icon={Users}>
                  {event.attendances.confirmed_users && event.attendances.confirmed_users.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-medium text-white mb-3 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        Confirmed Attendees ({event.attendances.confirmed_users.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {event.attendances.confirmed_users.map((user) => (
                          <div key={user.id} className="bg-black rounded-lg p-3">
                            <Link href={`/players/${user.id}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <User className="w-4 h-4 text-gray-400" />
                                <div>
                                  <div className="text-white font-medium">{user.username}</div>
                                  <div className="text-gray-500 text-xs">
                                    Confirmed {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                                  </div>
                                </div>
                              </div>
                              {user.following && (
                                <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                                  Following
                                </Badge>
                              )}
                            </div>
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {event.attendances.confirmed_vtcs && event.attendances.confirmed_vtcs.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-medium text-white mb-3 flex items-center">
                        <Building2 className="w-4 h-4 mr-2 text-blue-500" />
                        Participating VTCs ({event.attendances.confirmed_vtcs.length})
                      </h4>
                      <div className="space-y-3">
                        {event.attendances.confirmed_vtcs.map((vtc) => (
                          <div key={vtc.id} className="bg-black rounded-lg p-3">
                            <Link href={`/vtcs/${vtc.id}`}>
                                <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Building2 className="w-4 h-4 text-gray-400" />
                                    <div>
                                    <div className="text-white font-medium">{vtc.name}</div>
                                    <div className="text-gray-500 text-xs">
                                        Joined {formatDistanceToNow(new Date(vtc.created_at), { addSuffix: true })}
                                    </div>
                                    </div>
                                </div>
                                {vtc.following && (
                                    <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                                    Following
                                    </Badge>
                                )}
                                </div>
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {event.attendances.unsure_users && event.attendances.unsure_users.length > 0 && (
                    <div>
                      <h4 className="text-lg font-medium text-white mb-3 flex items-center">
                        <HelpCircle className="w-4 h-4 mr-2 text-yellow-500" />
                        Unsure Attendees ({event.attendances.unsure_users.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {event.attendances.unsure_users.map((user) => (
                          <div key={user.id} className="bg-black rounded-lg p-3">
                            <Link href={`/players/${user.id}`}>
                                <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <div>
                                    <div className="text-white font-medium">{user.username}</div>
                                    <div className="text-gray-500 text-xs">
                                        Marked {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                                    </div>
                                    </div>
                                </div>
                                {user.following && (
                                    <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400">
                                    Following
                                    </Badge>
                                )}
                                </div>
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </InfoCard>
              )}

              {/* Mobile Attendance Stats */}
              <div className="lg:hidden">
                <InfoCard title="Attendance" icon={Users}>
                  <div className="space-y-3">
                    <StatItem 
                      icon={CheckCircle}
                      label="Confirmed"
                      value={event.attendances.confirmed}
                      iconColor="text-green-500"
                    />
                    <StatItem 
                      icon={HelpCircle}
                      label="Unsure"
                      value={event.attendances.unsure}
                      iconColor="text-yellow-500"
                    />
                    <StatItem 
                      icon={Building2}
                      label="VTCs"
                      value={event.attendances.vtcs}
                      iconColor="text-blue-500"
                    />
                  </div>
                  {(event.attendances.confirmed_users || event.attendances.unsure_users) && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-4 border-white/20 text-white hover:bg-white/10"
                      onClick={() => setShowAttendees(!showAttendees)}
                    >
                      View Attendees
                    </Button>
                  )}
                </InfoCard>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Server & Game Info */}
              <InfoCard title="Server Information" icon={Gamepad2}>
                <div className="space-y-4">
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Server</div>
                    <div className="text-white font-medium flex items-center">
                      <Globe className="w-4 h-4 mr-2 text-green-500" />
                      {event.server.name}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Game</div>
                    <div className="text-white font-medium flex items-center">
                      <Gamepad2 className="w-4 h-4 mr-2 text-blue-500" />
                      {event.game}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Language</div>
                    <div className="text-white font-medium flex items-center">
                      <Languages className="w-4 h-4 mr-2 text-purple-500" />
                      {event.language}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Event Type</div>
                    <div className="text-white font-medium flex items-center">
                      <Hash className="w-4 h-4 mr-2 text-red-500" />
                      {event.event_type.key} - {event.event_type.name}
                    </div>
                  </div>
                </div>
              </InfoCard>

              {/* Organizer */}
              <InfoCard title="Organized By" icon={User}>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-black rounded-lg">
                    <User className="w-8 h-8 text-red-500" />
                    <div className="flex-1">
                      <div className="text-white font-medium hover:text-red-400"><Link href={`/players/${event.user.id}`}>{event.user.username}</Link></div>
                      <div className="text-gray-400 text-sm">Event Creator</div>
                      <div className="text-gray-500 text-xs">ID: {event.user.id}</div>
                    </div>
                  </div>
                  
                  {event.vtc && event.vtc.id > 0 && (
                    <div className="flex items-center space-x-3 p-3 bg-black rounded-lg">
                      <Building2 className="w-8 h-8 text-blue-500" />
                      <div className="flex-1">
                        <div className="text-white font-medium hover:text-red-400"><Link href={`/vtcs/${event.vtc.id}`}>{event.vtc.name}</Link></div>
                        <div className="text-gray-400 text-sm">Organizing VTC</div>
                        <div className="text-gray-500 text-xs">ID: {event.vtc.id}</div>
                      </div>
                    </div>
                  )}
                </div>
              </InfoCard>

              {/* Links */}
              <InfoCard title="Event Links" icon={LinkIcon}>
                <div className="space-y-3">
                  {event.voice_link && (
                    <a 
                      href={event.voice_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-3 bg-black rounded-lg hover:bg-white/5 transition-colors group"
                    >
                      <Volume2 className="w-5 h-5 text-green-500" />
                      <span className="text-white group-hover:text-green-400 transition-colors">Voice Chat</span>
                      <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                    </a>
                  )}
                  
                  {event.external_link && (
                    <a 
                      href={event.external_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-3 bg-black rounded-lg hover:bg-white/5 transition-colors group"
                    >
                      <ExternalLink className="w-5 h-5 text-blue-500" />
                      <span className="text-white group-hover:text-blue-400 transition-colors">External Link</span>
                      <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                    </a>
                  )}
                  
                  <a 
                    href={`https://truckersmp.com${event.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-3 bg-black rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <Calendar className="w-5 h-5 text-red-500" />
                    <span className="text-white group-hover:text-red-400 transition-colors">TruckersMP Event Page</span>
                    <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                  </a>
                </div>
              </InfoCard>

              {/* DLCs Required */}
              {event.dlcs && (
                <InfoCard title="Required DLCs" icon={Gamepad2}>
                  <div className="bg-black rounded-lg p-4">
                    {Object.keys(event.dlcs).length > 0 ? (
                      <>
                        <div className="text-yellow-400 text-sm mb-2">Required DLCs</div>
                        {Object.entries(event.dlcs).map(([dlcId, dlcName]) => (
                          <a
                            key={dlcId}
                            href={`https://store.steampowered.com/app/${dlcId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex justify-between border-b border-gray-700 py-1 hover:bg-gray-800 rounded transition-colors"
                          >
                            <span className="text-white font-mono">{dlcId}</span>
                            <span className="text-gray-300">{dlcName}</span>
                          </a>
                        ))}
                        <p className="text-gray-400 text-sm mt-3">
                          This event requires specific DLC content to participate.
                        </p>
                      </>
                    ) : (
                      <div className="text-green-400 text-sm">
                        This event does not require any DLC content to participate.
                      </div>
                    )}
                  </div>
                </InfoCard>
              )}


              {/* Event Meta */}
              <InfoCard title="Event Information" icon={Hash}>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Event ID</span>
                    <span className="text-white font-mono">#{event.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Slug</span>
                    <span className="text-white font-mono text-xs">{event.slug}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created</span>
                    <span className="text-white" title={format(createdDate, 'PPpp')}>
                      {formatDistanceToNow(createdDate, { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Updated</span>
                    <span className="text-white" title={format(updatedDate, 'PPpp')}>
                      {formatDistanceToNow(updatedDate, { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Featured</span>
                    <span className="text-white">
                      {event.featured === "true" ? (
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          <Star className="w-3 h-3 mr-1" />
                          Yes
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-gray-500 text-gray-400">
                          No
                        </Badge>
                      )}
                    </span>
                  </div>
                </div>
              </InfoCard>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}