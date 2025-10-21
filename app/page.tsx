'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import EstimatorModal from '@/components/estimator/EstimatorModal';

function HomeContent() {
  const searchParams = useSearchParams();
  const isEmbedded = searchParams.get('embed') === '1';

  return (
    <div className={`min-h-screen ${isEmbedded ? 'embedded' : ''}`}>
      <EstimatorModal />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <HomeContent />
    </Suspense>
  );
}
