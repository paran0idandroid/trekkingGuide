import { useEffect, useRef, useState } from 'react';
import type {
  GearInventoryItem,
  GearInventoryStatus,
  GearSystem,
  GearSystemSlug,
} from '../types';
import GearItemActionPanel from './GearItemActionPanel';

interface WantedGearListProps {
  items: GearInventoryItem[];
  systems: GearSystem[];
  isSaving: boolean;
  openItemId: string | null;
  onOpenItemChange: (id: string | null) => void;
  onRename: (id: string, name: string) => Promise<string | null>;
  onMoveStatus: (id: string, status: GearInventoryStatus) => Promise<boolean>;
  onMoveSystem: (id: string, systemSlug: GearSystemSlug) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export default function WantedGearList({
  items,
  systems,
  isSaving,
  openItemId,
  onOpenItemChange,
  onRename,
  onMoveStatus,
  onMoveSystem,
  onDelete,
}: WantedGearListProps) {
  const [completingId, setCompletingId] = useState<string | null>(null);
  const itemButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const actionAreaRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const openMenuId = items.some(item => item.id === openItemId) ? openItemId : null;

  useEffect(() => {
    if (!openMenuId) return;

    const handlePointerDown = (event: PointerEvent) => {
      const actionArea = actionAreaRefs.current[openMenuId];
      if (event.target instanceof Node && actionArea?.contains(event.target)) return;
      onOpenItemChange(null);
      requestAnimationFrame(() => itemButtonRefs.current[openMenuId]?.focus());
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [onOpenItemChange, openMenuId]);

  const closeActions = (id: string) => {
    onOpenItemChange(null);
    requestAnimationFrame(() => itemButtonRefs.current[id]?.focus());
  };

  const markOwned = async (id: string) => {
    setCompletingId(id);
    if (!await onMoveStatus(id, 'owned')) setCompletingId(null);
  };

  if (items.length === 0) {
    return (
      <p className="gear-glass-module w-full max-w-3xl rounded-2xl px-6 py-12 text-center text-sm text-forest-600">
        还没有待购买装备
      </p>
    );
  }

  return (
    <section className={`gear-glass-module relative w-full max-w-3xl overflow-visible rounded-2xl p-2 ${openMenuId ? 'z-30' : ''}`} aria-label="待购买装备清单">
      {items.map((item, index) => (
        <div
          key={item.id}
          ref={element => {
            actionAreaRefs.current[item.id] = element;
          }}
          className={`relative min-w-0 ${index < items.length - 1 ? 'border-b border-forest-100/70' : ''}`}
        >
          <div className="flex min-h-12 items-center gap-2 px-2 sm:min-h-10">
            <button
              type="button"
              aria-label={`标记 ${item.name} 为已买到`}
              title="已买到"
              data-pending={completingId === item.id}
              onClick={() => void markOwned(item.id)}
              disabled={isSaving}
              className="gear-glass-check gear-owned-check gear-pressable grid h-11 w-11 shrink-0 place-items-center rounded-full disabled:cursor-not-allowed sm:h-8 sm:w-8"
            >
              <span
                className={`grid h-8 w-8 place-items-center rounded-full border text-white ${
                  completingId === item.id
                    ? 'border-white/80 bg-forest-500'
                    : 'border-forest-300/70 bg-white/50'
                }`}
              >
                <svg aria-hidden="true" viewBox="0 0 20 20" className={`h-4 w-4 ${completingId === item.id ? 'opacity-100' : 'opacity-0'}`}>
                  <path d="m5 10 3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
            <button
              ref={button => {
                itemButtonRefs.current[item.id] = button;
              }}
              type="button"
              aria-label={`操作 ${item.name}`}
              aria-expanded={openMenuId === item.id}
              aria-controls={`gear-actions-${item.id}`}
              onClick={() => onOpenItemChange(openMenuId === item.id ? null : item.id)}
              title={item.name}
              className="gear-glass-item gear-pressable min-h-11 min-w-0 flex-1 truncate rounded-xl px-2 text-left text-sm text-forest-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-1 sm:min-h-8"
            >
              {item.name}
            </button>
          </div>

          {openMenuId === item.id && (
            <GearItemActionPanel
              item={item}
              systems={systems}
              isSaving={isSaving}
              onRename={onRename}
              onMoveStatus={onMoveStatus}
              onMoveSystem={onMoveSystem}
              onDelete={onDelete}
              onClose={() => closeActions(item.id)}
            />
          )}
        </div>
      ))}
    </section>
  );
}
