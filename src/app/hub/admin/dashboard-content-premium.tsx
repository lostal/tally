'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import {
  Table2,
  UtensilsCrossed,
  Settings,
  ArrowRight,
  TrendingUp,
  Users,
  Clock,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { springSmooth, springSnappy } from '@/lib/motion';
import type { Restaurant } from '@/types/database';

interface DashboardContentPremiumProps {
  restaurant: Restaurant;
  stats: {
    tables: number;
    products: number;
    categories: number;
    occupiedTables: number;
  };
}

// --- Animated Stat Card ---
function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  index,
  highlight,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: React.ElementType;
  index: number;
  highlight?: boolean;
}) {
  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-2xl border-2 p-6',
        highlight ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card'
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.05, ...springSmooth }}
      whileHover={{ y: -2, transition: springSnappy }}
    >
      {/* Background icon */}
      <Icon
        className={cn(
          'absolute -top-4 -right-4 size-24 rotate-12',
          highlight ? 'text-primary-foreground/10' : 'text-muted/30'
        )}
      />

      <div className="relative">
        <div className="flex items-center gap-2">
          <Icon
            className={cn(
              'size-4',
              highlight ? 'text-primary-foreground/70' : 'text-muted-foreground'
            )}
          />
          <p
            className={cn(
              'text-sm',
              highlight ? 'text-primary-foreground/70' : 'text-muted-foreground'
            )}
          >
            {label}
          </p>
        </div>

        <motion.p
          className="mt-2 font-serif text-4xl font-bold"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 + index * 0.05, ...springSnappy }}
        >
          {value}
        </motion.p>

        {sublabel && (
          <p
            className={cn(
              'mt-1 text-sm',
              highlight ? 'text-primary-foreground/60' : 'text-muted-foreground'
            )}
          >
            {sublabel}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// --- Quick Link Card ---
function QuickLinkCard({
  href,
  icon: Icon,
  label,
  description,
  index,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  description: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.05, ...springSmooth }}
    >
      <Link
        href={href}
        className={cn(
          'group flex items-center justify-between',
          'border-border bg-card rounded-2xl border-2 p-5',
          'transition-all duration-200',
          'hover:border-primary hover:shadow-primary/5 hover:shadow-lg'
        )}
      >
        <div className="flex items-center gap-4">
          <div className="bg-secondary/50 group-hover:bg-primary/10 flex size-12 items-center justify-center rounded-xl transition-colors">
            <Icon className="group-hover:text-primary size-5 transition-colors" />
          </div>
          <div>
            <span className="font-medium">{label}</span>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
        </div>
        <ArrowRight className="text-muted-foreground group-hover:text-primary size-5 transition-all group-hover:translate-x-1" />
      </Link>
    </motion.div>
  );
}

// --- Live Activity Indicator ---
function LiveIndicator() {
  return (
    <motion.div
      className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 }}
    >
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
      </span>
      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">En vivo</span>
    </motion.div>
  );
}

/**
 * DashboardContentPremium - Enhanced admin dashboard with premium animations
 */
export function DashboardContentPremium({ restaurant, stats }: DashboardContentPremiumProps) {
  const occupancyRate =
    stats.tables > 0 ? Math.round((stats.occupiedTables / stats.tables) * 100) : 0;

  return (
    <div className="space-y-10">
      {/* Header */}
      <motion.div
        className="flex items-start justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springSmooth}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <motion.p
              className="text-muted-foreground text-sm tracking-widest uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              Panel de administración
            </motion.p>
            <LiveIndicator />
          </div>
          <h1 className="font-serif text-4xl font-bold">{restaurant.name}</h1>
        </div>

        <motion.div
          className="text-muted-foreground flex items-center gap-2 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Clock className="size-4" />
          {new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </motion.div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Mesas ocupadas"
          value={`${stats.occupiedTables}/${stats.tables}`}
          sublabel={`${occupancyRate}% ocupación`}
          icon={Table2}
          index={0}
          highlight={stats.occupiedTables > 0}
        />
        <StatCard
          label="Productos"
          value={stats.products}
          sublabel={`en ${stats.categories} categorías`}
          icon={UtensilsCrossed}
          index={1}
        />
        <StatCard
          label="Clientes activos"
          value={stats.occupiedTables * 2} // Estimate
          sublabel="en tu restaurante"
          icon={Users}
          index={2}
        />
      </div>

      {/* Quick Actions */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="text-muted-foreground size-4" />
          <h2 className="font-serif text-xl">Acceso rápido</h2>
        </div>

        <div className="space-y-3">
          <QuickLinkCard
            href="/admin/menu"
            icon={UtensilsCrossed}
            label="Gestionar menú"
            description="Añade, edita o elimina productos"
            index={0}
          />
          <QuickLinkCard
            href="/admin/cash"
            icon={Wallet}
            label="Control de Caja"
            description="Entradas, salidas y cierre Z"
            index={1}
          />
          <QuickLinkCard
            href="/admin/tables"
            icon={Table2}
            label="Ver mesas"
            description="Gestiona el estado de las mesas"
            index={2}
          />
          <QuickLinkCard
            href="/admin/settings"
            icon={Settings}
            label="Configuración"
            description="Personaliza tu restaurante"
            index={3}
          />
        </div>
      </motion.div>

      {/* Footer hint */}
      <motion.p
        className="text-muted-foreground text-center text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Tip: Usa el POS para gestionar pedidos en tiempo real
      </motion.p>
    </div>
  );
}
