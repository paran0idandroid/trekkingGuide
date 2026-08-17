import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { Link, Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import GearAnatomyViewer from '../components/GearAnatomyViewer';
import GearSystemIcon from '../components/GearSystemIcon';
import { getGearKnowledge } from '../data/gearKnowledge';
import { getProductsByCategory } from '../data/gearCatalog';
import { getGearSystemBySlug } from '../data/gearSystems';
import {
  createGearDetailSearch,
  resolveGearDetailState,
  toggleSelectionSection,
} from '../lib/gearSystemState';
import type { GearDetailTab, GearSelectionSection } from '../lib/gearSystemState';
import type { BudgetTier, GearProduct } from '../types';

const tabs: { id: GearDetailTab; label: string }[] = [
  { id: 'overview', label: '认识装备' },
  { id: 'selection', label: '怎么选' },
  { id: 'products', label: '产品参考' },
];

const tierOrder: BudgetTier[] = ['entry', 'mid', 'premium'];
const tierLabels: Record<BudgetTier, string> = {
  entry: '入门',
  mid: '进阶',
  premium: '高端',
};

export default function GearSystemPage() {
  const { systemSlug = '' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [expandedSection, setExpandedSection] = useState<GearSelectionSection | null>('indicators');
  const [showAnatomy, setShowAnatomy] = useState(false);
  const system = getGearSystemBySlug(systemSlug);
  const detailState = system
    ? resolveGearDetailState(searchParams, system.items.map(item => item.knowledgeId))
    : undefined;
  const selectedSystemItem = system && detailState
    ? system.items.find(item => item.knowledgeId === detailState.gear)
    : undefined;

  useEffect(() => {
    if (detailState?.needsNormalization) {
      setSearchParams(
        createGearDetailSearch(searchParams, detailState.gear, detailState.tab),
        { replace: true },
      );
    }
  }, [detailState?.gear, detailState?.needsNormalization, detailState?.tab, searchParams, setSearchParams]);

  if (!system) {
    return <Navigate to="/gear-knowledge" replace />;
  }

  if (!selectedSystemItem) {
    return <Navigate to={`/gear-knowledge/${system.slug}`} replace state={location.state} />;
  }

  const selectedTab = detailState?.tab ?? 'overview';
  const knowledge = getGearKnowledge(selectedSystemItem.knowledgeId);

  if (!knowledge) {
    throw new Error(`装备知识未注册：${selectedSystemItem.knowledgeId}`);
  }

  const products = selectedSystemItem.productCategories.flatMap(category => getProductsByCategory(category));
  const selectedKnowledgeId = selectedSystemItem.knowledgeId;
  const selectedTabIndex = tabs.findIndex(tab => tab.id === selectedTab);
  const routeSlug = location.state?.routeSlug as string | undefined;

  function updateGear(knowledgeId: string) {
    if (knowledgeId === selectedKnowledgeId) return;
    setSearchParams(createGearDetailSearch(searchParams, knowledgeId, 'overview'));
    setExpandedSection('indicators');
    requestAnimationFrame(() => contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  function updateTab(tab: GearDetailTab) {
    if (tab === selectedTab) return;
    setSearchParams(createGearDetailSearch(searchParams, selectedKnowledgeId, tab));
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | undefined;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = tabs.length - 1;
    if (nextIndex === undefined) return;

    event.preventDefault();
    const nextTab = tabs[nextIndex];
    if (!nextTab) return;
    updateTab(nextTab.id);
    requestAnimationFrame(() => tabRefs.current[nextIndex]?.focus());
  }

  return (
    <div className="gear-page-environment min-h-screen py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <nav className="mb-7 flex items-center gap-2 text-xs text-forest-500" aria-label="面包屑">
          <Link to="/gear-knowledge" state={routeSlug ? { routeSlug } : undefined} className="hover:text-forest-700">
            装备知识
          </Link>
          <span className="text-sand-500">/</span>
          <span className="text-forest-700">{system.name}</span>
        </nav>

        <header className="flex max-w-3xl items-center gap-5 md:gap-7">
          <span className="gear-glass-chip grid h-24 w-24 shrink-0 place-items-center rounded-3xl md:h-32 md:w-32">
            <GearSystemIcon system={system.slug} className="h-20 w-20 md:h-28 md:w-28" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wider text-forest-500">装备系统</p>
            <h1 className="mt-2 font-display text-2xl font-bold text-forest-800 md:text-4xl">{system.name}</h1>
            <p className="mt-3 text-sm leading-7 text-forest-600 md:text-base">{system.summary}</p>
          </div>
        </header>

        <div className="mt-9 border-t border-sand-100/70 pt-7 md:mt-12 md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-10 md:pt-10">
          <aside className="gear-glass-module -mx-1 rounded-2xl p-2 md:sticky md:top-24 md:z-20 md:mx-0 md:self-start md:p-3">
            <p className="mb-2 hidden px-2 text-xs font-medium uppercase tracking-wider text-forest-500 md:block">系统装备</p>
            <div className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
              {system.items.map(item => {
                const active = item.knowledgeId === selectedSystemItem.knowledgeId;
                return (
                  <button
                    key={item.knowledgeId}
                    onClick={() => updateGear(item.knowledgeId)}
                    aria-current={active ? 'true' : undefined}
                    className={`gear-glass-item gear-pressable relative min-h-11 shrink-0 rounded-xl px-4 text-left text-sm md:w-full ${
                      active
                        ? 'border-forest-100 bg-forest-50/70 font-medium text-forest-800 shadow-sm'
                        : 'text-forest-600 hover:text-forest-800'
                    }`}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>
          </aside>

          <main ref={contentRef} className="scroll-mt-32 pt-7 md:pt-0">
            <div className="border-b border-sand-100 pb-5">
              <p className="text-xs text-forest-500">{system.name}</p>
              <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold text-forest-800 md:text-3xl">{selectedSystemItem.name}</h2>
                {knowledge.id === 'backpack' && (
                  <button
                    onClick={() => setShowAnatomy(true)}
                    className="gear-glass-action gear-pressable min-h-11 rounded-full px-4 text-xs font-medium text-forest-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-300"
                  >
                    查看 3D 结构
                  </button>
                )}
              </div>
              <p className="mt-2 text-sm leading-6 text-forest-600">{knowledge.summary}</p>
            </div>

            <div className="gear-glass-segment relative mt-5 grid grid-cols-3 rounded-2xl p-1" role="tablist" aria-label={`${selectedSystemItem.name}内容`}>
              <span
                aria-hidden="true"
                className="gear-tab-indicator absolute bottom-1 left-1 top-1 w-[calc((100%_-_0.5rem)/3)] rounded-xl"
                style={{ transform: `translateX(${selectedTabIndex * 100}%)` }}
              />
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  ref={element => { tabRefs.current[index] = element; }}
                  id={`gear-tab-${tab.id}`}
                  role="tab"
                  aria-selected={selectedTab === tab.id}
                  aria-controls="gear-detail-panel"
                  tabIndex={selectedTab === tab.id ? 0 : -1}
                  onClick={() => updateTab(tab.id)}
                  onKeyDown={event => handleTabKeyDown(event, index)}
                  className={`gear-pressable relative z-10 min-h-11 rounded-xl px-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-300 ${
                    selectedTab === tab.id
                      ? 'text-forest-800'
                      : 'text-forest-600 hover:text-forest-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div
              id="gear-detail-panel"
              role="tabpanel"
              aria-labelledby={`gear-tab-${selectedTab}`}
              tabIndex={0}
              className="py-7 focus-visible:rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-300 md:py-9"
            >
              {selectedTab === 'overview' && (
                <div className="space-y-8">
                  <section>
                    <h3 className="text-lg font-semibold text-forest-800">它解决什么问题</h3>
                    <p className="mt-3 text-sm leading-7 text-forest-600">{knowledge.purpose}</p>
                  </section>
                  <section>
                    <h3 className="text-lg font-semibold text-forest-800">适用场景</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {knowledge.scenarios.map(scenario => (
                        <span key={scenario} className="gear-glass-chip rounded-full px-3 py-1.5 text-xs text-forest-700">
                          {scenario}
                        </span>
                      ))}
                    </div>
                  </section>
                  <section>
                    <h3 className="text-lg font-semibold text-forest-800">核心知识</h3>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {knowledge.nodes.map(node => (
                        <article key={node.id} className="gear-glass-module rounded-2xl p-4">
                          <h4 className="text-sm font-semibold text-forest-800">{node.label}</h4>
                          <p className="mt-2 text-xs leading-6 text-forest-600">{node.content}</p>
                        </article>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {selectedTab === 'selection' && (
                <div className="space-y-3">
                  <SelectionGroup
                    title="关键选购指标"
                    expanded={expandedSection === 'indicators'}
                    onToggle={() => setExpandedSection(current => toggleSelectionSection(current, 'indicators'))}
                  >
                    <div className="space-y-5">
                      {knowledge.indicators.map(indicator => (
                        <article key={indicator.name} className="border-l-2 border-forest-200 pl-4">
                          <h4 className="text-sm font-semibold text-forest-800">{indicator.name}</h4>
                          <p className="mt-2 text-xs leading-6 text-forest-600">{indicator.what}</p>
                          <p className="mt-2 rounded-xl bg-forest-50 p-3 text-xs leading-6 text-forest-700">
                            选购提示：{indicator.tip}
                          </p>
                        </article>
                      ))}
                    </div>
                  </SelectionGroup>
                  <SelectionGroup
                    title="类型与参数对比"
                    expanded={expandedSection === 'comparison'}
                    onToggle={() => setExpandedSection(current => toggleSelectionSection(current, 'comparison'))}
                  >
                    <div className="space-y-6">
                      {knowledge.comparisons.map(comparison => (
                        <section key={comparison.label}>
                          <h4 className="text-sm font-semibold text-forest-800">{comparison.label}</h4>
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            {comparison.items.map(item => (
                              <article key={item.value} className="rounded-xl bg-sand-50 p-4">
                                <p className="text-sm font-medium text-forest-800">{item.value}</p>
                                <p className="mt-1 text-xs leading-6 text-forest-600">{item.desc}</p>
                              </article>
                            ))}
                          </div>
                        </section>
                      ))}
                    </div>
                  </SelectionGroup>
                  <SelectionGroup
                    title="常见误区"
                    expanded={expandedSection === 'mistakes'}
                    onToggle={() => setExpandedSection(current => toggleSelectionSection(current, 'mistakes'))}
                  >
                    <ol className="space-y-3">
                      {knowledge.mistakes.map((mistake, index) => (
                        <li key={mistake} className="flex gap-3 text-sm leading-6 text-forest-600">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sand-100 text-xs font-medium text-sand-800">
                            {index + 1}
                          </span>
                          {mistake}
                        </li>
                      ))}
                    </ol>
                  </SelectionGroup>
                </div>
              )}

              {selectedTab === 'products' && (
                <ProductReference products={products} />
              )}
            </div>
          </main>
        </div>
      </div>

      {showAnatomy && <GearAnatomyViewer item={knowledge} onClose={() => setShowAnatomy(false)} />}
    </div>
  );
}

interface SelectionGroupProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}

function SelectionGroup({ title, expanded, onToggle, children }: SelectionGroupProps) {
  return (
    <section className="gear-glass-module rounded-2xl">
      <button
        onClick={onToggle}
        aria-expanded={expanded}
        className="gear-pressable flex min-h-11 w-full items-center justify-between rounded-2xl px-5 py-4 text-left text-sm font-semibold text-forest-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-300"
      >
        {title}
        <span className={`text-sand-700 transition-transform ${expanded ? 'rotate-45' : ''}`}>＋</span>
      </button>
      {expanded && <div className="border-t border-sand-100/70 px-5 py-5">{children}</div>}
    </section>
  );
}

function ProductReference({ products }: { products: GearProduct[] }) {
  if (products.length === 0) {
    return (
      <div className="gear-glass-module rounded-2xl p-6 text-sm leading-6 text-forest-600">
        这类装备当前先提供基础知识和选购方法，产品资料将在完成核验后补充。
      </div>
    );
  }

  return (
    <div className="space-y-9">
      <p className="text-sm leading-6 text-forest-600">
        以下产品沿用现有资料，按预算层级整理，不代表年度排名。购买前请再次核对尺码、版本和当前价格。
      </p>
      {tierOrder.map(tier => {
        const tierProducts = products.filter(product => product.tier === tier);
        if (tierProducts.length === 0) return null;

        return (
          <section key={tier}>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-forest-800">{tierLabels[tier]}</h3>
              <span className="text-xs text-forest-500">{tierProducts.length} 款</span>
              <span className="h-px flex-1 bg-sand-100" />
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {tierProducts.map(product => (
                <article key={product.id} className="gear-glass-module rounded-2xl p-5">
                  <p className="text-xs text-forest-500">{product.category}</p>
                  <h4 className="mt-1 text-base font-semibold text-forest-800">
                    {product.brandZh} {product.model}
                  </h4>
                  <p className="mt-2 text-sm font-medium text-sand-800">
                    ¥{product.priceRange[0]}–{product.priceRange[1]}
                  </p>
                  {product.intro && <p className="mt-3 line-clamp-4 text-xs leading-6 text-forest-600">{product.intro}</p>}
                  <div className="mt-4 flex gap-2">
                    <a
                      href={product.links.taobao}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gear-glass-action gear-pressable inline-flex min-h-11 items-center rounded-full px-3 text-xs text-forest-700"
                    >
                      淘宝搜索
                    </a>
                    <a
                      href={product.links.jd}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gear-glass-action gear-pressable inline-flex min-h-11 items-center rounded-full px-3 text-xs text-forest-700"
                    >
                      京东搜索
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
