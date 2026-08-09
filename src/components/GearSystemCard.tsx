import { Link } from 'react-router-dom';
import type { GearSystem } from '../types';
import GearSystemIcon from './GearSystemIcon';

interface Props {
  system: GearSystem;
  routeSlug?: string;
}
export default function GearSystemCard({ system, routeSlug }: Props) {
  return (
    <Link
      to={`/gear-knowledge/${system.slug}`}
      state={routeSlug ? { routeSlug } : undefined}
      className="group flex min-h-52 flex-col items-center justify-center rounded-3xl border border-transparent px-3 py-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-sand-100 hover:bg-sand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-300"
    >
      <GearSystemIcon
        system={system.slug}
        className="h-24 w-24 transition-transform duration-300 group-hover:scale-105 md:h-28 md:w-28"
      />
      <h2 className="mt-4 text-base font-semibold leading-snug text-forest-800">
        {system.name}
      </h2>
      <p className="mt-1.5 text-xs leading-relaxed text-forest-500">
        {system.representativeItems}
      </p>
    </Link>
  );
}
