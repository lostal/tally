'use client';

import { motion } from 'motion/react';
import { Table2, UtensilsCrossed, FolderOpen, ArrowRight } from 'lucide-react';
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

export function DashboardContent({ restaurant, stats }: DashboardContentProps) {
  return (
    <div className="space-y-12">
      {/* Header - Large and editorial */}
      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-muted-foreground text-sm tracking-widest uppercase">
          Panel de administración
        </p>
        <h1 className="font-serif">{restaurant.name}</h1>
      </motion.div>

      {/* Stats - Simple text, no colors */}
      <motion.div
        className="grid gap-6 sm:grid-cols-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="border-border rounded-2xl border-2 p-8">
          <p className="text-muted-foreground text-sm">Mesas ocupadas</p>
          <p className="mt-2 font-serif text-5xl">
            {stats.occupiedTables}/{stats.tables}
          </p>
        </div>
        <div className="border-border rounded-2xl border-2 p-8">
          <p className="text-muted-foreground text-sm">Productos en menú</p>
          <p className="mt-2 font-serif text-5xl">{stats.products}</p>
          <p className="text-muted-foreground mt-1 text-sm">en {stats.categories} categorías</p>
        </div>
      </motion.div>

      {/* Quick links - Clean, minimal */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="font-serif text-xl">Acceso rápido</h2>

        <div className="space-y-2">
          <Link
            href="/admin/menu"
            className="group border-border hover:border-primary flex items-center justify-between rounded-2xl border-2 p-6 transition-colors"
          >
            <div className="flex items-center gap-4">
              <UtensilsCrossed className="size-5" />
              <span className="font-medium">Gestionar menú</span>
            </div>
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/admin/tables"
            className="group border-border hover:border-primary flex items-center justify-between rounded-2xl border-2 p-6 transition-colors"
          >
            <div className="flex items-center gap-4">
              <Table2 className="size-5" />
              <span className="font-medium">Ver mesas</span>
            </div>
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/admin/settings"
            className="group border-border hover:border-primary flex items-center justify-between rounded-2xl border-2 p-6 transition-colors"
          >
            <div className="flex items-center gap-4">
              <FolderOpen className="size-5" />
              <span className="font-medium">Configuración</span>
            </div>
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
