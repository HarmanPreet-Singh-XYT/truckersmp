interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ComponentType<{ className?: string }>;
}
import { cn } from '@/lib/utils';
export function StatCard({ title, value, subtitle, trend, icon: Icon }: StatCardProps) {
  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-gray-400'
  };

  return (
    <div className="bg-zinc-900 rounded-xl p-6 border-2 border-white/10 hover:border-red-500/50 transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wide">{title}</h3>
        {Icon && <Icon className="w-6 h-6 text-red-500" />}
      </div>
      
      <div className="space-y-2">
        <div className="text-3xl font-bold text-white">{value.toLocaleString()}</div>
        {subtitle && (
          <div className={cn('text-sm', trend ? trendColors[trend] : 'text-gray-400')}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}