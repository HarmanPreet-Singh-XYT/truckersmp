import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, LucideIcon, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence, useSpring, useTransform, useMotionValue } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string | number;
  icon?: React.ComponentType<{ className?: string }> | LucideIcon;
  variant?: 'default' | 'gradient' | 'outline' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  error?: string | boolean;
  onClick?: () => void;
  className?: string;
  formatValue?: (value: string | number) => string;
  sparklineData?: number[];
  compareValue?: string | number;
  compareLabel?: string;
  badge?: {
    text: string;
    variant?: 'default' | 'success' | 'warning' | 'error';
  };
  animate?: boolean;
  delay?: number;
  description?: string;
  actions?: React.ReactNode;
  color?: 'red' | 'blue' | 'green' | 'purple' | 'orange' | 'pink';
}

// Animated number component
function AnimatedNumber({ value, format }: { value: number; format?: (val: number) => string }) {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: 1000 });
  const displayValue = useTransform(springValue, (latest) => 
    format ? format(Math.round(latest)) : Math.round(latest).toLocaleString()
  );

  useEffect(() => {
    motionValue.set(typeof value === 'number' ? value : parseFloat(value));
  }, [motionValue, value]);

  return <motion.span>{displayValue}</motion.span>;
}

// Mini sparkline component
function Sparkline({ data, trend }: { data: number[]; trend?: 'up' | 'down' | 'neutral' }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  const trendColor = {
    up: 'stroke-green-400',
    down: 'stroke-red-400',
    neutral: 'stroke-gray-400'
  };

  return (
    <svg className="w-full h-8" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        points={points}
        className={cn('transition-all duration-500', trend ? trendColor[trend] : 'stroke-gray-400')}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  trendValue,
  icon: Icon, 
  variant = 'default',
  size = 'md',
  loading = false,
  error,
  onClick,
  className,
  formatValue,
  sparklineData,
  compareValue,
  compareLabel,
  badge,
  animate = true,
  delay = 0,
  description,
  actions,
  color = 'red'
}: StatCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const trendConfig = {
    up: {
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      borderColor: 'border-green-400/20',
      icon: TrendingUp
    },
    down: {
      color: 'text-red-400',
      bgColor: 'bg-red-400/10',
      borderColor: 'border-red-400/20',
      icon: TrendingDown
    },
    neutral: {
      color: 'text-gray-400',
      bgColor: 'bg-gray-400/10',
      borderColor: 'border-gray-400/20',
      icon: Minus
    }
  };

  const colorConfig = {
    red: 'text-red-500 hover:border-red-500/50',
    blue: 'text-blue-500 hover:border-blue-500/50',
    green: 'text-green-500 hover:border-green-500/50',
    purple: 'text-purple-500 hover:border-purple-500/50',
    orange: 'text-orange-500 hover:border-orange-500/50',
    pink: 'text-pink-500 hover:border-pink-500/50'
  };

  const sizeConfig = {
    sm: 'p-4 text-2xl',
    md: 'p-6 text-3xl',
    lg: 'p-8 text-4xl'
  };

  const variants = {
    default: `bg-zinc-900 border-2 border-white/10 ${colorConfig[color]}`,
    gradient: `bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border-2 border-white/10 ${colorConfig[color]}`,
    outline: `bg-transparent border-2 border-white/20 ${colorConfig[color]} hover:bg-zinc-900/50`,
    glass: `bg-white/5 backdrop-blur-md border border-white/10 ${colorConfig[color]}`
  };

  const badgeVariants = {
    default: 'bg-gray-400/10 text-gray-400 border-gray-400/20',
    success: 'bg-green-400/10 text-green-400 border-green-400/20',
    warning: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
    error: 'bg-red-400/10 text-red-400 border-red-400/20'
  };

  const displayValue = formatValue ? formatValue(value) : value.toLocaleString();
  const TrendIcon = trend ? trendConfig[trend].icon : null;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        delay: delay,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  if (error) {
    return (
      <motion.div
        ref={cardRef}
        className={cn(
          "rounded-xl transition-all duration-200",
          sizeConfig[size],
          variants[variant],
          "border-red-500/50 bg-red-500/5",
          className
        )}
        initial="hidden"
        animate="visible"
        // variants={cardVariants}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-400">
              {typeof error === 'string' ? error : 'Failed to load data'}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "rounded-xl transition-all duration-200 group relative overflow-hidden",
        sizeConfig[size],
        variants[variant],
        onClick && "cursor-pointer active:scale-[0.98]",
        className
      )}
      initial={animate ? "hidden" : "visible"}
      animate="visible"
      // variants={cardVariants}
      whileHover={onClick ? { scale: 1.02 } : {}}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Background glow effect */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className={cn("absolute inset-0 opacity-10", `bg-${color}-500`)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wide">
                {title}
              </h3>
              {badge && (
                <span className={cn(
                  "px-2 py-0.5 text-xs font-medium rounded-full border",
                  badgeVariants[badge.variant || 'default']
                )}>
                  {badge.text}
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
          {Icon && (
            <motion.div 
              className="relative"
              animate={{ rotate: isHovered ? 360 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <Icon className={cn("w-6 h-6 transition-all duration-200", `text-${color}-500`)} />
              <motion.div 
                className={cn("absolute inset-0 blur-xl", `bg-${color}-500/20`)}
                animate={{ opacity: isHovered ? 1 : 0 }}
              />
            </motion.div>
          )}
        </div>
        
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              <div className="h-8 bg-white/10 rounded animate-pulse" />
              <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse" />
              {sparklineData && <div className="h-8 bg-white/10 rounded animate-pulse" />}
            </div>
          ) : (
            <>
              <div className={cn("font-bold text-white", sizeConfig[size].split(' ')[1])}>
                {animate && typeof value === 'number' ? (
                  <AnimatedNumber value={value} format={formatValue} />
                ) : (
                  displayValue
                )}
              </div>
              
              {/* Sparkline */}
              {sparklineData && sparklineData.length > 0 && (
                <div className="w-full h-8 mt-2">
                  <Sparkline data={sparklineData} trend={trend} />
                </div>
              )}
              
              {/* Subtitle and trend */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {subtitle && (
                    <span className={cn(
                      'text-sm',
                      trend ? trendConfig[trend].color : 'text-gray-400'
                    )}>
                      {subtitle}
                    </span>
                  )}
                  
                  {trend && trendValue && (
                    <motion.div
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
                        trendConfig[trend].bgColor,
                        trendConfig[trend].borderColor,
                        trendConfig[trend].color
                      )}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: delay + 0.3 }}
                    >
                      {TrendIcon && <TrendIcon className="w-3 h-3" />}
                      <span>{trendValue}</span>
                    </motion.div>
                  )}
                </div>

                {/* Compare value */}
                {compareValue && (
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">{compareValue}</div>
                    {compareLabel && (
                      <div className="text-xs text-gray-500">{compareLabel}</div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              {actions && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  {actions}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}