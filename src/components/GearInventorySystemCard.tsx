import { useEffect, useRef } from 'react';
import type {
  GearInventoryItem,
  GearInventoryStatus,
  GearSystem,
  GearSystemSlug,
} from '../types';
import GearItemActionPanel from './GearItemActionPanel';
import GearSystemIcon from './GearSystemIcon';

interface GearInventorySystemCardProps {
  system: GearSystem;
  systems: GearSystem[];
  items: GearInventoryItem[];
  isSaving: boolean;
  openItemId: string | null;
  onOpenItemChange: (id: string | null) => void;
  onRename: (id: string, name: string) => Promise<string | null>;
  onMoveStatus: (id: string, status: GearInventoryStatus) => Promise<boolean>;
  onMoveSystem: (id: string, systemSlug: GearSystemSlug) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export default function GearInventorySystemCard({
  system,
  systems,
  items,
  isSaving,
  openItemId,
  onOpenItemChange,
  onRename,
  onMoveStatus,
  onMoveSystem,
  onDelete,
}: GearInventorySystemCardProps) {
  const itemButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const actionAreaRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isDense = items.length >= 6;
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

  return (
    <section className={`gear-glass-module relative overflow-visible rounded-2xl ${openMenuId ? 'z-30' : ''}`}>
      <header className="flex items-center gap-2.5 rounded-t-2xl border-b border-white/40 bg-forest-50/40 px-3 py-2.5">
        <span className="gear-glass-chip grid h-8 w-8 shrink-0 place-items-center rounded-xl text-forest-700">
          <GearSystemIcon system={system.slug} className="h-6 w-6" />
        </span>
        <h2 className="min-w-0 flex-1 truncate text-sm font-semibold tracking-tight text-forest-800">
          {system.name}
        </h2>
        <span className="gear-glass-chip grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-xs font-medium tabular-nums text-forest-600">
          {items.length}
        </span>
      </header>

      {items.length === 0 ? (
        <p className="px-3 py-3 text-xs text-forest-500">暂无装备</p>
      ) : (
        <div className={`px-2 py-1.5 ${isDense ? 'grid grid-cols-1 gap-x-3 sm:grid-cols-2' : ''}`}>
          {items.map(item => (
            <div
              key={item.id}
              ref={element => {
                actionAreaRefs.current[item.id] = element;
              }}
              className="relative min-w-0 border-b border-forest-50 last:border-b-0"
            >
              <div className="flex min-h-11 items-center gap-2 px-2 sm:min-h-8">
                <span aria-hidden="true" className="gear-item-dot h-1.5 w-1.5 shrink-0 rounded-full bg-forest-300" />
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
        </div>
      )}
    </section>
  );
}
