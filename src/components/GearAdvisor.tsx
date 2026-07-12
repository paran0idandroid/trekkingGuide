import { useState } from 'react';
import { UserProfile, GearRecommendation } from '../types';
import { recommend } from '../lib/gearEngine';
import { getGearProfile } from '../data/routeProfiles';
import GearQuiz from './GearQuiz';
import GearResults from './GearResults';

type View = 'closed' | 'quiz' | 'results';

interface Props {
  routeName: string;
}

export default function GearAdvisor({ routeName }: Props) {
  const [view, setView] = useState<View>('closed');
  const [results, setResults] = useState<GearRecommendation[]>([]);

  const handleStart = () => setView('quiz');

  const handleQuizSubmit = (profile: UserProfile) => {
    const profileData = getGearProfile(routeName);
    if (!profileData) return;
    const recs = recommend(profileData, profile);
    setResults(recs);
    setView('results');
  };

  const handleReset = () => {
    setResults([]);
    setView('quiz');
  };

  const handleClose = () => {
    setView('closed');
    setResults([]);
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={handleStart}
        className="fixed top-20 right-6 z-40 bg-forest-500 text-white hover:bg-forest-600 px-4 py-2.5 rounded-full text-sm shadow-lg transition-all duration-300"
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          生成装备清单
        </span>
      </button>

      {view === 'quiz' && (
        <GearQuiz onSubmit={handleQuizSubmit} onClose={handleClose} />
      )}

      {view === 'results' && (
        <GearResults recommendations={results} onReset={handleReset} onClose={handleClose} />
      )}
    </>
  );
}
