import { Badge } from '@/components/ui/badge';
import { Users, Globe, Shield, Calendar, UserCircle, Gamepad2, ChevronRight, Truck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { APICompanySimple } from '@/types/web';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { TruckersAPI } from '@/lib/api';
import { useEffect, useState } from 'react';
import { VTC } from '@/types/api';

interface VTCCardProps {
  vtc: APICompanySimple;
  variant?: 'default' | 'featured';
  index?: number;
}

export function VTCCard({ vtc, variant = 'default', index = 0 }: VTCCardProps) {
  const createdDate = new Date(vtc.created);
  const ageString = formatDistanceToNow(createdDate, { addSuffix: true });
  const [vtcInfo, setVTC] = useState<VTC | null>(null);
  
    useEffect(() => {
      const fetchVTCData = async () => {
        try {
          const vtcId = vtc.id;
          if (isNaN(vtcId)) {
            throw new Error('Invalid VTC ID');
          }
          
          const [vtcData] = await Promise.all([
            TruckersAPI.getVTC(vtcId),
          ]);
          
          setVTC(vtcData.response);
        } catch (err: any) {
          // setError(err.message || 'Failed to load VTC');
        } finally {
          // setLoading(false);
        }
      };
  
      fetchVTCData();
    },[]);
  // Animation variants
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        delay: index * 0.1,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      // variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link href={`/vtcs/${vtc.id}`} className="block">
        <div 
          className={cn(
            "relative group rounded-xl border-2 transition-all duration-300",
            "bg-gradient-to-br backdrop-blur-sm overflow-hidden",
            variant === 'featured' 
              ? "from-blue-950/80 to-indigo-950/80 border-blue-500/30 hover:border-blue-400/60 shadow-xl shadow-blue-500/10" 
              : "from-zinc-900/95 to-zinc-800/95 border-zinc-700/50 hover:border-red-500/50",
            "hover:shadow-2xl"
          )}
        >
          {/* Animated background gradient */}
          <div className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
            variant === 'featured'
              ? "bg-gradient-to-br from-blue-500/10 to-indigo-500/10"
              : "bg-gradient-to-br from-red-500/5 to-orange-500/5"
          )} />

          {/* Header with cover image placeholder */}
          <div className={cn(
            "relative h-32 bg-gradient-to-br",
            variant === 'featured'
              ? "from-blue-600/20 to-indigo-600/20"
              : "from-zinc-800 to-zinc-700"
          )}>
            {/* Pattern overlay */}
            {vtcInfo ? <div className="absolute inset-0 opacity-80">
              <div className="h-full w-full" style={{
                backgroundImage: `url("${vtcInfo.cover}")`,
              }} />
            </div> : <div className="absolute inset-0 opacity-10">
              <div className="h-full w-full" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>}

            {/* Featured badge */}
            {variant === 'featured' && (
              <motion.div
                initial={{ x: -100 }}
                animate={{ x: 0 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="absolute top-4 left-4"
              >
                <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 shadow-lg">
                  ✨ Featured VTC
                </Badge>
              </motion.div>
            )}

            {/* VTC Logo placeholder */}
            <div className="absolute -bottom-6 left-6">
              <div className={cn(
                "w-16 h-16 rounded-xl border-2 border-red-500 flex items-center justify-center font-bold text-2xl shadow-xl bg-black",
                
              )}>
                <Truck className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 pt-10">
            {/* Header info */}
            <div className="mb-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                    {vtc.name}
                  </h3>
                  <p className="text-sm text-zinc-400 font-mono">[{vtc.tag}]</p>
                </div>
                
                {vtc.verified && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                  >
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-md">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </motion.div>
                )}
              </div>

              {vtc.slogan && (
                <p className="text-sm text-zinc-300 italic opacity-80 line-clamp-2">
                  {`"`}{vtc.slogan}{`"`}
                </p>
              )}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center space-x-2 text-zinc-300">
                <div className="p-1.5 rounded-lg bg-zinc-800/50">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Members</p>
                  <p className="text-sm font-semibold">{vtc.members_count.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-zinc-300">
                <div className="p-1.5 rounded-lg bg-zinc-800/50">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Founded</p>
                  <p className="text-sm font-semibold">{ageString}</p>
                </div>
              </div>
            </div>

            {/* Tags section */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="secondary" className="text-xs border-zinc-700">
                <Globe className="w-3 h-3 mr-1" />
                {vtc.language}
              </Badge>
              
              {(vtc.games.ets || vtc.games.ats) && (
                <Badge variant="secondary" className="text-xs border-zinc-700">
                  <Gamepad2 className="w-3 h-3 mr-1" />
                  {[vtc.games.ets && 'ETS2', vtc.games.ats && 'ATS'].filter(Boolean).join(' & ')}
                </Badge>
              )}
              
              <Badge 
                className={cn(
                  "text-xs ml-auto",
                  vtc.recruitment === 'Open' 
                    ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border-green-500/50' 
                    : 'bg-zinc-800/50 text-zinc-400 border-zinc-700'
                )}
              >
                {vtc.recruitment === 'Open' ? '🟢 Recruiting' : '🔴 Closed'}
              </Badge>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
              <div className="flex items-center space-x-2 text-sm text-zinc-400">
                <UserCircle className="w-4 h-4" />
                <span>Owner: <span className="text-zinc-300 font-medium">{vtc.owner_username}</span></span>
              </div>
              
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </div>
          </div>

          {/* Hover effect line */}
          <div className={cn(
            "absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300",
            variant === 'featured'
              ? "from-blue-500 via-indigo-500 to-blue-500"
              : "from-red-500 via-orange-500 to-red-500"
          )} />
        </div>
      </Link>
    </motion.div>
  );
}