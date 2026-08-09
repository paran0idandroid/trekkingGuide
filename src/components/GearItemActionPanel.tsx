import { useEffect, useState } from 'react';
import type {
  GearInventoryItem,
  GearInventoryStatus,
  GearSystem,
  GearSystemSlug,
} from '../types';

interface GearItemActionPanelProps {
  item: GearInventoryItem;
  systems: GearSystem[];
  isSaving: boolean;
  onRename: (id: string, name: string) => Promise<string | null>;
  onMoveStatus: (id: string, status: GearInventoryStatus) => Promise<boolean>;
  onMoveSystem: (id: string, systemSlug: GearSystemSlug) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onClose: () => void;
}

type ActionMode = 'menu' | 'edit' | 'system' | 'delete';

export default function GearItemActionPanel({
  item,
  systems,
  isSaving,
  onRename,
  onMoveStatus,
  onMoveSystem,
  onDelete,
  onClose,
}: GearItemActionPanelProps) {
  const [mode, setMode] = useState<ActionMode>('menu');
  const [editName, setEditName] = useState(item.name);
  const [editError, setEditError] = useState('');
  const [selectedSystem, setSelectedSystem] = useState<GearSystemSlug>(
    item.systemSlug ?? systems[0].slug,
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const saveEdit = async () => {
    const error = await onRename(item.id, editName);
    if (error) {
      setEditError(error);
      return;
    }
    onClose();
  };

  const saveSystem = async () => {
    if (selectedSystem === item.systemSlug) {
      onClose();
      return;
    }
    if (await onMoveSystem(item.id, selectedSystem)) onClose();
  };

  const moveStatus = async () => {
    const nextStatus: GearInventoryStatus = item.status === 'owned' ? 'wanted' : 'owned';
    if (await onMoveStatus(item.id, nextStatus)) onClose();
  };

  const deleteItem = async () => {
    if (await onDelete(item.id)) onClose();
  };

  return (
    <>
      <button
        type="button"
        aria-label="关闭装备操作"
        onPointerDown={onClose}
        className="gear-scrim fixed inset-0 z-40 bg-forest-900/20 sm:hidden"
      />
      <div
        id={`gear-actions-${item.id}`}
        role="dialog"
        aria-label={`${item.name}的操作`}
        className="gear-action-surface gear-glass-panel gear-sheet-enter fixed inset-x-3 bottom-3 z-50 rounded-2xl p-2 sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-[calc(100%+0.25rem)] sm:min-w-60 sm:rounded-xl"
      >
        <header className="flex items-center justify-between gap-3 px-2 py-1.5">
          <p className="min-w-0 truncate text-sm font-semibold text-forest-800">{item.name}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="gear-glass-action gear-pressable min-h-11 min-w-11 rounded-full text-lg leading-none text-forest-600 sm:min-h-8 sm:min-w-8"
          >
            ×
          </button>
        </header>

        {mode === 'menu' && (
          <div className="space-y-0.5" role="group" aria-label="装备操作">
            <button type="button" onClick={() => setMode('edit')} className="gear-glass-action gear-pressable block min-h-11 w-full rounded-xl px-3 text-left text-sm text-forest-700">
              编辑名称
            </button>
            <button type="button" onClick={() => setMode('system')} className="gear-glass-action gear-pressable block min-h-11 w-full rounded-xl px-3 text-left text-sm text-forest-700">
              更改系统
            </button>
            <button type="button" onClick={() => void moveStatus()} disabled={isSaving} className="gear-glass-action gear-pressable block min-h-11 w-full rounded-xl px-3 text-left text-sm text-forest-700 disabled:text-forest-400">
              {item.status === 'owned' ? '移到待购买' : '标记为已买到'}
            </button>
            <button type="button" onClick={() => setMode('delete')} className="gear-glass-action gear-pressable block min-h-11 w-full rounded-xl px-3 text-left text-sm text-sand-800">
              删除
            </button>
          </div>
        )}

        {mode === 'edit' && (
          <div className="px-2 pb-2">
            <label htmlFor={`edit-gear-${item.id}`} className="mb-1.5 block text-xs font-medium text-forest-600">
              装备名称
            </label>
            <input
              id={`edit-gear-${item.id}`}
              type="text"
              value={editName}
              onChange={event => {
                setEditName(event.target.value);
                if (editError) setEditError('');
              }}
              onKeyDown={event => {
                if (event.key === 'Enter') void saveEdit();
              }}
              autoFocus
              className="min-h-11 w-full rounded-xl border border-forest-200 bg-white px-3 text-sm text-forest-800 outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-100"
            />
            {editError && <p className="mt-2 text-xs text-sand-800" role="alert">{editError}</p>}
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" onClick={() => setMode('menu')} className="gear-glass-action gear-pressable min-h-11 rounded-xl px-3 text-sm text-forest-700">取消</button>
              <button type="button" onClick={() => void saveEdit()} disabled={isSaving} className="gear-glass-primary gear-pressable min-h-11 rounded-xl px-4 text-sm font-medium text-white disabled:opacity-60">保存</button>
            </div>
          </div>
        )}

        {mode === 'system' && (
          <div className="px-2 pb-2">
            <label htmlFor={`system-${item.id}`} className="mb-1.5 block text-xs font-medium text-forest-600">
              所属系统
            </label>
            <select
              id={`system-${item.id}`}
              autoFocus
              value={selectedSystem}
              onChange={event => setSelectedSystem(event.target.value as GearSystemSlug)}
              className="min-h-11 w-full rounded-xl border border-forest-200 bg-white px-3 text-sm text-forest-800 outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-100"
            >
              {systems.map(system => (
                <option key={system.slug} value={system.slug}>{system.name}</option>
              ))}
            </select>
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" onClick={() => setMode('menu')} className="gear-glass-action gear-pressable min-h-11 rounded-xl px-3 text-sm text-forest-700">取消</button>
              <button type="button" onClick={() => void saveSystem()} disabled={isSaving} className="gear-glass-primary gear-pressable min-h-11 rounded-xl px-4 text-sm font-medium text-white disabled:opacity-60">确认</button>
            </div>
          </div>
        )}

        {mode === 'delete' && (
          <div className="rounded-xl bg-sand-50 px-3 py-3">
            <p className="text-sm font-medium text-sand-900">确认删除这件装备？</p>
            <p className="mt-1 text-xs text-sand-800">删除后无法恢复。</p>
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" autoFocus onClick={() => setMode('menu')} className="gear-glass-action gear-pressable min-h-11 rounded-xl px-3 text-sm text-forest-700">取消</button>
              <button type="button" onClick={() => void deleteItem()} disabled={isSaving} className="gear-glass-action gear-pressable min-h-11 rounded-xl bg-sand-100/70 px-4 text-sm font-medium text-sand-900 disabled:text-sand-500">确认删除</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
