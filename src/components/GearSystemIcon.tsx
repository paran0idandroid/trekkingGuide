import type { GearSystemSlug } from '../types';

interface Props {
  system: GearSystemSlug;
  className?: string;
}
export default function GearSystemIcon({ system, className = 'h-28 w-28' }: Props) {
  const artwork = (() => {
    switch (system) {
      case 'carry-storage':
        return (
          <>
            <path d="M44 35c0-9 7-16 16-16h8c9 0 16 7 16 16v64H44V35Z" className="fill-forest-400 stroke-forest-700" />
            <path d="M52 30c2-8 7-12 12-12s10 4 12 12" className="fill-none stroke-sand-300" />
            <path d="M37 45c-7 7-9 20-7 39m61-39c7 7 9 20 7 39" className="fill-none stroke-forest-700" />
            <path d="M51 57h26v30H51z" className="fill-sand-100 stroke-forest-700" />
            <path d="M57 63h14m-14 9h14" className="stroke-sand-600" />
            <path d="M39 92h50" className="stroke-forest-700" />
          </>
        );
      case 'shelter':
        return (
          <>
            <path d="M16 94 61 30l51 64H16Z" className="fill-forest-300 stroke-forest-700" />
            <path d="m61 30 4 64H24l37-64Z" className="fill-sand-100 stroke-forest-700" />
            <path d="M65 94V55L91 94" className="fill-forest-500 stroke-forest-700" />
            <path d="m18 94-7 9m99-9 7 9" className="stroke-sand-600" />
            <circle cx="9" cy="105" r="3" className="fill-sand-500" />
            <circle cx="119" cy="105" r="3" className="fill-sand-500" />
          </>
        );
      case 'sleep':
        return (
          <>
            <path d="M31 24h50c11 0 20 9 20 20v55c0 8-6 14-14 14H45c-8 0-14-6-14-14V24Z" className="fill-sand-200 stroke-forest-700" />
            <path d="M42 35c0-7 6-13 13-13h19c9 0 16 7 16 16v58c0 6-5 11-11 11H53c-6 0-11-5-11-11V35Z" className="fill-forest-400 stroke-forest-700" />
            <path d="M55 32h17c5 0 9 4 9 9v8H50v-8c0-5 2-9 5-9Z" className="fill-sand-100 stroke-forest-700" />
            <path d="M50 60h31M50 72h31M58 84h15" className="stroke-forest-700" />
          </>
        );
      case 'wear-movement':
        return (
          <>
            <path d="m92 17 8 3-24 91-8-3 24-91Z" className="fill-sand-300 stroke-forest-700" />
            <path d="m88 26 18 5" className="stroke-forest-700" />
            <path d="M25 43h35l7 28 22 12c7 4 10 10 8 17H32c-9 0-15-7-13-16l6-41Z" className="fill-forest-400 stroke-forest-700" />
            <path d="M27 43h31l5 20H23l4-20Z" className="fill-sand-100 stroke-forest-700" />
            <path d="M29 55h29M25 87h62" className="stroke-forest-700" />
            <path d="m74 111-2 8" className="stroke-forest-700" />
          </>
        );
      case 'food-hydration':
        return (
          <>
            <path d="M23 33h52v12c0 17-9 31-26 31S23 62 23 45V33Z" className="fill-sand-200 stroke-forest-700" />
            <path d="M17 33h64M31 25h36" className="stroke-forest-700" />
            <path d="m38 77-7 25m29-25 7 25M27 102h44" className="stroke-forest-700" />
            <path d="M91 40h14c5 0 9 4 9 9v49c0 7-5 12-12 12H94c-7 0-12-5-12-12V49c0-5 4-9 9-9Z" className="fill-forest-400 stroke-forest-700" />
            <path d="M92 31h12v9H92z" className="fill-sand-100 stroke-forest-700" />
            <path d="M91 70h14" className="stroke-sand-100" />
          </>
        );
      case 'navigation-safety':
        return (
          <>
            <circle cx="56" cy="65" r="38" className="fill-sand-100 stroke-forest-700" />
            <circle cx="56" cy="65" r="29" className="fill-forest-100 stroke-forest-500" />
            <path d="m49 73 10-25 7 34-17-9Z" className="fill-forest-500 stroke-forest-700" />
            <path d="M21 32c13-18 53-28 82-7" className="fill-none stroke-sand-500" />
            <path d="M92 18h20v15H92z" className="fill-forest-400 stroke-forest-700" />
            <path d="M91 91h25v25H91z" className="fill-sand-200 stroke-forest-700" />
            <path d="M103.5 97v13M97 103.5h13" className="stroke-forest-700" />
          </>
        );
    }
  })();

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 128 128"
      className={className}
      fill="none"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {artwork}
    </svg>
  );
}
