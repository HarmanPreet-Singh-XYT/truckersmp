import { Event } from '@/types/api';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface EventCardProps {
  event: Event;
  variant?: 'default' | 'featured';
}

export function EventCard({ event, variant = 'default' }: EventCardProps) {
  const startTime = new Date(event.start_at);
  const timeUntil = formatDistanceToNow(startTime, { addSuffix: true });

  return (
    <Link href={`/events/${event.id}`}>
    <div 
      className={cn(
        "rounded-xl border-2 transition-all duration-200 hover:translate-y-[-4px]",
        variant === 'featured' 
          ? "bg-gradient-to-br from-red-500/20 to-red-900/20 border-red-500/50 hover:border-red-400" 
          : "bg-zinc-900 border-white/10 hover:border-red-500/50"
      )}
    >
      {event.banner && (
        <div className="aspect-video w-full relative overflow-hidden rounded-t-lg">
          <img 
            src={event.banner} 
            alt={event.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {variant === 'featured' && (
            <Badge className="absolute top-4 left-4 bg-red-500 text-white">
              Featured Event
            </Badge>
          )}
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{event.name}</h3>
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              {event.event_type.name}
            </Badge>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center space-x-2 text-gray-300">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{timeUntil}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-300">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{event.departure.city} → {event.arrive.city}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-300">
            <Users className="w-4 h-4" />
            <span className="text-sm">{event.attendances.confirmed} confirmed</span>
          </div>

          <div className="flex items-center space-x-2 text-gray-300">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{event.server.name}</span>
          </div>
        </div>

        {/* {event.description && (
          <p className="text-gray-400 text-sm line-clamp-3 mb-4">
            {event.description}
          </p>
        )} */}

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            by {event.user.username}
          </div>
          {event.vtc && (
            <Badge variant="secondary" className="text-xs">
              {event.vtc.name}
            </Badge>
          )}
        </div>
      </div>
    </div>
    </Link>
  );
}