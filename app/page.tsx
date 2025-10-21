'use client';

import { useSearchParams } from 'next/navigation';
import EstimatorModal from '@/components/estimator/EstimatorModal';

export default function Home() {
  const searchParams = useSearchParams();
  const isEmbedded = searchParams.get('embed') === '1';

  return (
    <div className={`min-h-screen ${isEmbedded ? 'embedded' : ''}`}>
      <EstimatorModal />
    </div>
  );
}
