'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loader from '@/app/loading'

export default function RootPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/tools');
  }, [router]);
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse text-primary"><Loader/></div>
    </div>
  );
}