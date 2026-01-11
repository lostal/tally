'use client';

import { motion } from 'motion/react';
import { Table2, UtensilsCrossed, FolderOpen, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Restaurant } from '@/types/database';

interface DashboardContentProps {
  restaurant: Restaurant;
  stats: {
    tables: number;
    products: number;
    categories: number;
    occupiedTables: number;
  };
}

const STAT_CARDS = [
  {
    key: 'tables',
    label: 'Mesas totales',
    icon: Table2,
    href: '/admin/tables',
    color: 'bg-blue-500/10 text-blue-500',
  },
  {
    key: 'occupiedTables',
    label: 'Mesas ocupadas',
    icon: Users,
    href: '/admin/tables',
    color: 'bg-orange-500/10 text-orange-500',
  },
  {
    key: 'categories',
    label: 'Categorías',
    icon: FolderOpen,
    href: '/admin/menu',
    color: 'bg-purple-500/10 text-purple-500',
  },
  {
    key: 'products',
    label: 'Productos',
    icon: UtensilsCrossed,
    href: '/admin/menu',
    color: 'bg-green-500/10 text-green-500',
  },
];

export function DashboardContent({ restaurant, stats }: DashboardContentProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Bienvenido</h1>
        <p className="text-muted-foreground mt-1">Panel de administración de {restaurant.name}</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((card, index) => {
          const Icon = card.icon;
          const value = stats[card.key as keyof typeof stats];

          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={card.href}
                className="bg-card hover:bg-accent block rounded-2xl border p-6 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className={`rounded-xl p-3 ${card.color}`}>
                    <Icon className="size-5" />
                  </div>
                  <ArrowRight className="text-muted-foreground size-4" />
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold">{value}</p>
                  <p className="text-muted-foreground text-sm">{card.label}</p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <motion.div
        className="bg-card rounded-2xl border p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="mb-4 font-semibold">Acciones rápidas</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/menu"
            className="bg-secondary hover:bg-accent flex items-center gap-3 rounded-xl p-4 transition-colors"
          >
            <UtensilsCrossed className="text-primary size-5" />
            <span className="font-medium">Gestionar menú</span>
          </Link>
          <Link
            href="/admin/tables"
            className="bg-secondary hover:bg-accent flex items-center gap-3 rounded-xl p-4 transition-colors"
          >
            <Table2 className="text-primary size-5" />
            <span className="font-medium">Ver mesas</span>
          </Link>
          <Link
            href="/admin/settings"
            className="bg-secondary hover:bg-accent flex items-center gap-3 rounded-xl p-4 transition-colors"
          >
            <FolderOpen className="text-primary size-5" />
            <span className="font-medium">Configuración</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
