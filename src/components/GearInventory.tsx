import { useEffect, useRef, useState } from 'react';
import { getGearSystems } from '../data/gearSystems';
import {
  addGearItem,
  getGearInventory,
  inferGearSystem,
  removeGearItem,
  saveGearInventory,
  updateGearItem,
  updateGearItemStatus,
  updateGearItemSystem,
  validateGearName,
} from '../lib/gearInventory';
import type {
  GearInventoryItem,
  GearInventoryStatus,
  GearSystemSlug,
} from '../types';
import GearInventorySystemCard from './GearInventorySystemCard';
import WantedGearList from './WantedGearList';

export default function GearInventory() {
  const [items, setItems] = useState<GearInventoryItem[]>([]);
  const [activeStatus, setActiveStatus] = useState<GearInventoryStatus>('owned');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [storageError, setStorageError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [addError, setAddError] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const isSavingRef = useRef(false);
  const revisionRef = useRef(0);
  const addAreaRef = useRef<HTMLDivElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);
  const systems = getGearSystems();

  const ownedItems = items.filter(item => item.status === 'owned');
  const wantedItems = items.filter(item => item.status === 'wanted');
  const unclassifiedItems = ownedItems.filter(item => item.systemSlug === null);

  useEffect(() => {
    let isActive = true;
    setItems([]);
    setActiveStatus('owned');
    setIsLoading(true);
    setStorageError('');

    const loadInventory = async () => {
      try {
        const inventory = await getGearInventory();
        if (isActive) {
          revisionRef.current = inventory.revision;
          setItems(inventory.items);
        }
      } catch (error) {
        if (isActive) {
          setStorageError(
            error instanceof Error
              ? error.message
              : '无法连接本地装备数据库，请确认项目已启动',
          );
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadInventory();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!isAdding) return;
    addInputRef.current?.focus();

    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && addAreaRef.current?.contains(event.target)) return;
      setIsAdding(false);
      setNewName('');
      setAddError('');
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsAdding(false);
      setNewName('');
      setAddError('');
      requestAnimationFrame(() => addButtonRef.current?.focus());
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAdding]);

  useEffect(() => {
    if (!feedbackMessage) return;
    const timer = window.setTimeout(() => setFeedbackMessage(''), 2000);
    return () => window.clearTimeout(timer);
  }, [feedbackMessage]);

  const commit = async (nextItems: GearInventoryItem[]): Promise<boolean> => {
    if (isSavingRef.current) return false;

    isSavingRef.current = true;
    setIsSaving(true);

    try {
      const inventory = await saveGearInventory(nextItems, revisionRef.current);
      revisionRef.current = inventory.revision;
      setItems(inventory.items);
      setStorageError('');
      return true;
    } catch (error) {
      setStorageError(error instanceof Error ? error.message : '无法保存装备清单，请重试');
      return false;
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

  const addItem = async (
    name: string,
    systemSlug: GearSystemSlug | null,
  ): Promise<string | null> => {
    const error = validateGearName(items, name);
    if (error) return error;

    const item: GearInventoryItem = {
      id: crypto.randomUUID(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
      status: activeStatus,
      systemSlug,
    };
    return await commit(addGearItem(items, item)) ? null : '无法保存装备清单，请重试';
  };

  const handleAdd = async () => {
    const error = await addItem(newName, inferGearSystem(newName));
    if (error) {
      setAddError(error);
      return;
    }
    setNewName('');
    setAddError('');
    setIsAdding(false);
    setFeedbackMessage(activeStatus === 'owned' ? '已添加到已有装备' : '已添加到待购买');
    requestAnimationFrame(() => addButtonRef.current?.focus());
  };

  const renameItem = async (id: string, name: string): Promise<string | null> => {
    const error = validateGearName(items, name, id);
    if (error) return error;
    return await commit(updateGearItem(items, id, name)) ? null : '无法保存装备清单，请重试';
  };

  const moveStatus = async (
    id: string,
    status: GearInventoryStatus,
  ): Promise<boolean> => {
    const saved = await commit(updateGearItemStatus(items, id, status));
    if (saved) setFeedbackMessage(status === 'owned' ? '已移到已有装备' : '已移到待购买');
    return saved;
  };

  const moveSystem = async (
    id: string,
    systemSlug: GearSystemSlug,
  ): Promise<boolean> => commit(updateGearItemSystem(items, id, systemSlug));

  const deleteItem = async (id: string): Promise<boolean> => commit(removeGearItem(items, id));

  const closeAdd = (restoreFocus = true) => {
    setIsAdding(false);
    setNewName('');
    setAddError('');
    if (restoreFocus) requestAnimationFrame(() => addButtonRef.current?.focus());
  };

  const switchStatus = (status: GearInventoryStatus) => {
    closeAdd(false);
    setOpenActionId(null);
    setActiveStatus(status);
  };

  return (
    <section className="gear-inventory-stage mx-auto w-full max-w-7xl px-4 pb-12 pt-20 md:px-6 md:pt-24">
      <header className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-forest-800 md:text-4xl">我的装备</h1>
          <p className="mt-1.5 text-sm tabular-nums text-forest-600">
            已有 {ownedItems.length} · 待购买 {wantedItems.length}
          </p>
        </div>

        <div ref={addAreaRef} className="relative shrink-0">
          <button
            ref={addButtonRef}
            type="button"
            aria-expanded={isAdding}
            aria-controls="gear-add-panel"
            onClick={() => {
              setOpenActionId(null);
              setIsAdding(value => !value);
            }}
            disabled={isSaving}
            className="gear-glass-primary gear-pressable min-h-11 rounded-full px-4 text-sm font-medium text-white disabled:opacity-60"
          >
            ＋ 添加
          </button>

          {isAdding && (
            <>
              <button type="button" aria-label="关闭添加装备" onPointerDown={() => closeAdd()} className="gear-scrim fixed inset-0 z-40 bg-forest-900/20 sm:hidden" />
              <div
                id="gear-add-panel"
                role="dialog"
                aria-labelledby="gear-add-title"
                className="gear-add-surface gear-glass-panel gear-sheet-enter fixed inset-x-3 bottom-3 z-50 rounded-2xl p-4 sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-14 sm:w-80 sm:rounded-xl"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h2 id="gear-add-title" className="text-base font-semibold text-forest-800">
                      添加到{activeStatus === 'owned' ? '已有装备' : '待购买'}
                    </h2>
                    <p className="mt-1 text-xs text-forest-500">输入名称后自动归入六大系统</p>
                  </div>
                  <button type="button" onClick={() => closeAdd()} aria-label="关闭" className="gear-glass-action gear-pressable min-h-11 min-w-11 rounded-full text-lg leading-none text-forest-600 sm:min-h-8 sm:min-w-8">×</button>
                </div>
                <input
                  ref={addInputRef}
                  type="text"
                  value={newName}
                  onChange={event => {
                    setNewName(event.target.value);
                    if (addError) setAddError('');
                  }}
                  onKeyDown={event => {
                    if (event.key === 'Enter') void handleAdd();
                  }}
                  placeholder="输入装备名称"
                  aria-label="装备名称"
                  className="min-h-11 w-full rounded-xl border border-forest-200 bg-white px-3 text-sm text-forest-800 outline-none placeholder:text-forest-400 focus:border-forest-500 focus:ring-2 focus:ring-forest-100"
                />
                {addError && <p className="mt-2 text-xs text-sand-800" role="alert">{addError}</p>}
                <div className="mt-3 flex justify-end gap-2">
                  <button type="button" onClick={() => closeAdd()} className="gear-glass-action gear-pressable min-h-11 rounded-xl px-3 text-sm text-forest-700">取消</button>
                  <button type="button" onClick={() => void handleAdd()} disabled={isSaving} className="gear-glass-primary gear-pressable min-h-11 rounded-xl px-4 text-sm font-medium text-white disabled:opacity-60">保存</button>
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      {storageError && (
        <p className="mb-4 rounded-xl bg-sand-50 px-4 py-3 text-sm text-sand-900" role="alert">
          {storageError}
        </p>
      )}

      <div className="gear-glass-segment relative mb-4 grid max-w-md grid-cols-2 rounded-2xl p-1" role="tablist" aria-label="装备清单">
        <span
          aria-hidden="true"
          className={`gear-tab-indicator absolute bottom-1 left-1 top-1 w-[calc(50%_-_0.25rem)] rounded-xl ${
            activeStatus === 'wanted' ? 'translate-x-full' : 'translate-x-0'
          }`}
        />
        <button type="button" role="tab" aria-selected={activeStatus === 'owned'} onClick={() => switchStatus('owned')} className={`gear-pressable relative z-10 min-h-11 rounded-xl px-3 py-2 text-sm font-medium ${activeStatus === 'owned' ? 'text-forest-800' : 'text-forest-600 hover:text-forest-800'}`}>
          已有装备 {ownedItems.length}
        </button>
        <button type="button" role="tab" aria-selected={activeStatus === 'wanted'} onClick={() => switchStatus('wanted')} className={`gear-pressable relative z-10 min-h-11 rounded-xl px-3 py-2 text-sm font-medium ${activeStatus === 'wanted' ? 'text-forest-800' : 'text-forest-600 hover:text-forest-800'}`}>
          待购买 {wantedItems.length}
        </button>
      </div>

      {isLoading ? (
        <div className="gear-glass-module rounded-2xl px-6 py-14 text-center">
          <p className="text-sm text-forest-600">正在加载装备清单</p>
        </div>
      ) : (
        <div role="tabpanel">
          {activeStatus === 'owned' ? (
            <>
              <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-3">
                {systems.map(system => (
                  <GearInventorySystemCard
                    key={system.slug}
                    system={system}
                    systems={systems}
                    items={ownedItems.filter(item => item.systemSlug === system.slug)}
                    isSaving={isSaving}
                    openItemId={openActionId}
                    onOpenItemChange={setOpenActionId}
                    onRename={renameItem}
                    onMoveStatus={moveStatus}
                    onMoveSystem={moveSystem}
                    onDelete={deleteItem}
                  />
                ))}
              </div>

              {unclassifiedItems.length > 0 && (
                <section className="mt-3 rounded-2xl border border-sand-200 bg-sand-50 p-4">
                  <h2 className="text-sm font-semibold text-sand-900">待归类</h2>
                  <p className="mt-1 text-xs text-sand-800">请选择这些装备所属的系统。</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {unclassifiedItems.map(item => (
                      <label key={item.id} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm text-forest-800">
                        <span>{item.name}</span>
                        <select
                          aria-label={`更改 ${item.name} 的系统`}
                          defaultValue=""
                          onChange={async event => {
                            if (event.target.value) {
                              const select = event.currentTarget;
                              const saved = await moveSystem(item.id, event.target.value as GearSystemSlug);
                              if (!saved) select.value = '';
                            }
                          }}
                          disabled={isSaving}
                          className="rounded-lg border border-forest-200 bg-white px-2 py-1 text-xs text-forest-700 outline-none focus:border-forest-500"
                        >
                          <option value="" disabled>选择系统</option>
                          {systems.map(system => (
                            <option key={system.slug} value={system.slug}>{system.name}</option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <WantedGearList
              items={wantedItems}
              systems={systems}
              isSaving={isSaving}
              openItemId={openActionId}
              onOpenItemChange={setOpenActionId}
              onRename={renameItem}
              onMoveStatus={moveStatus}
              onMoveSystem={moveSystem}
              onDelete={deleteItem}
            />
          )}
        </div>
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex justify-center px-4" aria-live="polite" aria-atomic="true">
        {feedbackMessage && (
          <p className="gear-surface-enter rounded-full bg-forest-800 px-4 py-2 text-sm font-medium text-white shadow-lg">
            {feedbackMessage}
          </p>
        )}
      </div>
    </section>
  );
}
