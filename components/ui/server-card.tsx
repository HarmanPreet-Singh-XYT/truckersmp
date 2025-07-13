import { Server } from '@/types/api';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, Shield, Wifi, MapPin, Car, Siren, Coffee, Calendar, Package, Gauge } from 'lucide-react';

interface ServerCardProps {
  server: Server;
}

export function ServerCard({ server }: ServerCardProps) {
  const playerPercentage = (server.players / server.maxplayers) * 100;
  
  return (
    <div className="bg-zinc-900 rounded-xl p-6 border-2 border-white/10 hover:border-red-500/50 transition-all duration-200 hover:translate-y-[-4px]">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{server.name}</h3>
          <p className="text-sm text-gray-400 mb-2">({server.shortname}) • ID: {server.id}</p>
          <div className="flex gap-2 flex-wrap">
            <Badge variant={server.online ? "default" : "destructive"}>
              {server.online ? 'Online' : 'Offline'}
            </Badge>
            {server.event && (
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                Event Server
              </Badge>
            )}
            {server.promods && (
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                ProMods
              </Badge>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{server.players}</div>
          <div className="text-sm text-gray-400">/ {server.maxplayers}</div>
        </div>
      </div>

      {/* Player Load Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-400 mb-1">
          <span>Player Load</span>
          <span>{playerPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-black rounded-full h-2">
          <div 
            className="bg-red-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(playerPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Connection Info */}
      <div className="mb-4 p-3 bg-black/50 rounded-lg">
        <div className="flex items-center space-x-2 text-sm">
          <Wifi className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300 font-mono">{server.ip}:{server.port}</span>
        </div>
      </div>

      {/* Server Details Grid */}
      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300">Queue: {server.queue}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300">
            {server.speedlimiter === 1 ? 'Speed Limited' : `${server.speedlimiter}km/h`}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300">{server.collisions ? 'Collisions' : 'No Collisions'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300">Map ID: {server.mapid}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Car className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300">{server.carsforplayers ? 'Cars Allowed' : 'No Cars'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Siren className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300">{server.policecarsforplayers ? 'Police Cars' : 'No Police'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Coffee className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300">{server.afkenabled ? 'AFK Kick' : 'No AFK Kick'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Gauge className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300">Sync: {server.syncdelay}ms</span>
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-2 gap-3 text-sm border-t border-white/10 pt-3">
        <div className="text-gray-300">
          <span className="text-gray-500">Game:</span> {server.game.toUpperCase()}
        </div>
        <div className="text-gray-300">
          <span className="text-gray-500">ID Prefix:</span> {server.idprefix}
        </div>
        <div className="text-gray-300 col-span-2">
          <span className="text-gray-500">Display Order:</span> {server.displayorder}
        </div>
      </div>

      {/* Special Event Banner */}
      {server.specialEvent && (
        <div className="mt-4 p-3 bg-red-500/20 rounded-lg border border-red-500/30">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm font-medium">Special Event Active</span>
          </div>
        </div>
      )}
    </div>
  );
}