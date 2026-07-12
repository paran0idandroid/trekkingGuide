export default function Footer() {
  return (
    <footer className="relative py-16 md:py-20 bg-forest-900 text-center overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-forest-700/30" />

      <div className="relative z-10 max-w-lg mx-auto px-6">
        {/* Liquid glass button - preview for next route */}
        <a
          href="#hero"
          className="liquid-glass-btn inline-flex items-center gap-2 !px-6 !py-3 !rounded-2xl mb-8 text-white/70 hover:text-white"
        >
          <span className="text-sm font-light tracking-wider">下一条路线即将上线</span>
          <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>

        <p className="text-forest-400/60 text-xs mb-8">更多精彩徒步路线正在准备中</p>

        <div className="pt-6 border-t border-forest-700/20 text-forest-300/60 text-xs">
          &copy; {new Date().getFullYear()} 乌孙古道 &middot; 徒步路线
        </div>
      </div>
    </footer>
  );
}
