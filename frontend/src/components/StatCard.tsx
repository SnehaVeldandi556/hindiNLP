import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  hindiTitle?: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'emerald' | 'blue' | 'amber' | 'rose' | 'purple';
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  hindiTitle,
  value,
  subtitle,
  icon: Icon,
  color = 'emerald',
  trend,
}) => {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-500',
    },
    blue: {
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      border: 'border-sky-100',
      iconBg: 'bg-sky-500',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-100',
      iconBg: 'bg-amber-500',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-100',
      iconBg: 'bg-rose-500',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-100',
      iconBg: 'bg-purple-500',
    },
  };

  const scheme = colorMap[color];

  return (
    <div className={`p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {title}
            </span>
            {hindiTitle && (
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                {hindiTitle}
              </span>
            )}
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
            {value}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              {trend && <span className="font-semibold text-emerald-600">{trend}</span>}
              {subtitle}
            </p>
          )}
        </div>

        <div className={`w-12 h-12 rounded-xl ${scheme.bg} ${scheme.text} flex items-center justify-center shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
