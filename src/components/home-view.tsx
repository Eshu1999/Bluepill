
'use client';

import * as React from 'react';
import { UserProfile } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription } from './ui/card';
import { ArrowRight, Pill, User, Package, QrCode, Search, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { ChemistRequestList } from './chemist-request-list';
import type { AuthUser } from '@/types';

type ActiveView = 'home' | 'profile' | 'inventory' | 'scanner' | 'medications';

interface HomeViewProps {
    profile: UserProfile | null;
    setActiveView: (view: ActiveView) => void;
    user: AuthUser;
}

export function HomeView({ profile, setActiveView, user }: HomeViewProps) {
  const accountType = profile?.accountType || 'normal';
  const router = useRouter();

  const QuickAccessCard = ({ title, description, icon, onClick, className }: { title: string, description?: string, icon: React.ReactNode, onClick: () => void, className?: string }) => (
    <Card className={cn("hover:shadow-md transition-shadow cursor-pointer", className)} onClick={onClick}>
        <CardHeader>
             <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    {icon}
                    <div>
                        <CardTitle>{title}</CardTitle>
                        {description && <CardDescription className="mt-1">{description}</CardDescription>}
                    </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground self-start" />
            </div>
        </CardHeader>
    </Card>
  );

  return (
    <div className="space-y-8">
      {accountType === 'chemist' && (
        <>
          <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight font-headline">Quick Access</h2>
              <div className="grid gap-6 md:grid-cols-2">
                    <QuickAccessCard 
                        title="Manage Inventory"
                        description="View and update stock levels"
                        icon={<Package className="h-6 w-6 text-primary" />}
                        onClick={() => router.push('/chemist/inventory')}
                    />
                    <QuickAccessCard 
                        title="View Profile"
                        description="Update your QR code and details"
                        icon={<User className="h-6 w-6 text-primary" />}
                        onClick={() => router.push('/profile')}
                    />
              </div>
          </div>
          <div>
              <h2 className="text-2xl font-bold tracking-tight font-headline mb-4">Pending Requests</h2>
              <ChemistRequestList user={user} />
          </div>
        </>
      )}
    </div>
  );
}
