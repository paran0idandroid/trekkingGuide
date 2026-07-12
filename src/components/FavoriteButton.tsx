import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isFavorite, toggleFavorite } from '../lib/favorites';
import { useAuth } from '../contexts/AuthContext';

interface FavoriteButtonProps {
  routeSlug: string;
  className?: string;
}

export default function FavoriteButton({ routeSlug, className = '' }: FavoriteButtonProps) {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [faved, setFaved] = useState(false);

  useEffect(() => {
    setFaved(isFavorite(routeSlug));
  }, [routeSlug]);

  const handleClick = () => {
    if (!isLoggedIn) {
      navigate('/auth');
      return;
    }
    const now = toggleFavorite(routeSlug);
    setFaved(now);
  };

  return (
    <button
      onClick={handleClick}
      className={`transition-all duration-300 ${className}`}
      aria-label={faved ? '取消收藏' : '收藏'}
    >
      <svg
        className={`w-5 h-5 transition-all duration-300 ${
          faved
            ? 'text-red-400 fill-red-400 scale-110'
            : 'text-white/40 hover:text-white/70'
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
