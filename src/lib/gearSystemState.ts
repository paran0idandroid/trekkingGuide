export type GearDetailTab = 'overview' | 'selection' | 'products';
export type GearSelectionSection = 'indicators' | 'comparison' | 'mistakes';

const detailTabs: GearDetailTab[] = ['overview', 'selection', 'products'];

export function resolveGearDetailState(
  searchParams: URLSearchParams,
  knowledgeIds: string[],
): { gear: string; tab: GearDetailTab; needsNormalization: boolean } {
  if (knowledgeIds.length === 0) {
    throw new Error('装备系统至少需要一个知识条目');
  }

  const requestedGear = searchParams.get('gear');
  const hasValidGear = requestedGear !== null && knowledgeIds.includes(requestedGear);
  const gear = hasValidGear ? requestedGear : knowledgeIds[0];
  const requestedTab = searchParams.get('tab');
  const hasValidTab = requestedTab !== null && detailTabs.includes(requestedTab as GearDetailTab);
  const tab = hasValidGear && hasValidTab ? requestedTab as GearDetailTab : 'overview';

  return {
    gear,
    tab,
    needsNormalization:
      requestedGear !== gear ||
      requestedTab === 'overview' ||
      (requestedTab !== null && requestedTab !== tab),
  };
}

export function createGearDetailSearch(
  searchParams: URLSearchParams,
  gear: string,
  tab: GearDetailTab,
): URLSearchParams {
  const next = new URLSearchParams(searchParams);
  next.set('gear', gear);
  if (tab === 'overview') next.delete('tab');
  else next.set('tab', tab);
  return next;
}

export function toggleSelectionSection(
  current: GearSelectionSection | null,
  next: GearSelectionSection,
): GearSelectionSection | null {
  return current === next ? null : next;
}
