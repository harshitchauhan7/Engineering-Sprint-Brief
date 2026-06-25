'use client';

import { CreateWebPage } from '@/components/CreateWebPage';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CreatePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Protect route - only logged in users
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return <CreateWebPage />;
}
