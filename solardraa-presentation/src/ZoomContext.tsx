import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, ScanSearch, X } from 'lucide-react';

export interface ZoomModalItem {
  id: string;
  type: 'chart' | 'image';
  title: string;
  subtitle?: string;
  content?: ReactNode;
  imageSrc?: string;
  imageDesc?: string;
}

interface ZoomContextType {
  activeItem: ZoomModalItem | null;
  openZoom: (item: ZoomModalItem) => void;
  closeZoom: () => void;
}

const ZoomContext = createContext<ZoomContextType | null>(null);

export function ZoomProvider({ children }: { children: ReactNode }) {
  const [activeItem, setActiveItem] = useState<ZoomModalItem | null>(null);

  const openZoom = (item: ZoomModalItem) => {
    setActiveItem(item);
  };

  const closeZoom = () => {
    setActiveItem(null);
  };

  return (
    <ZoomContext.Provider
      value={{
        activeItem,
        openZoom,
        closeZoom,
      }}
    >
      {children}
      <ZoomModalDialog />
    </ZoomContext.Provider>
  );
}

export function useZoomModal() {
  const ctx = useContext(ZoomContext);
  if (!ctx) throw new Error('useZoomModal must be used within ZoomProvider');
  return ctx;
}

function ZoomModalDialog() {
  const { activeItem, closeZoom } = useZoomModal();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeItem) {
        e.preventDefault();
        e.stopPropagation();
        closeZoom();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeItem, closeZoom]);

  return (
    <AnimatePresence>
      {activeItem && (
        <motion.div
          key="zoom-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-6 bg-[#040914]/85 backdrop-blur-md"
          onClick={() => closeZoom()}
        >
          <motion.div
            key="zoom-window"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-gradient-to-b from-[#0e213b] to-[#071324] border border-[#4285f4]/40 rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.85),0_0_35px_rgba(103,202,255,0.18)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-[#233f63] flex items-center justify-between gap-4 bg-[#0a182c]/90">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-[#143257] text-[#67caff] border border-[#2d568b]">
                  {activeItem.type === 'chart' ? <BarChart3 size={20} /> : <ScanSearch size={20} />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] tracking-wider uppercase font-bold text-[#67caff] bg-[#143257] px-2 py-0.5 rounded-full border border-[#2d568b]/70">
                      {activeItem.type === 'chart' ? 'Graphique Agrandie HD' : 'Figure Scientifique HD'}
                    </span>
                    <span className="text-[11px] text-[#73d9bb] font-semibold hidden sm:inline-block">
                      (Cliquez sur Fermer, en dehors ou Échap pour fermer)
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-white truncate mt-0.5">
                    {activeItem.title}
                  </h2>
                  {activeItem.subtitle && (
                    <p className="text-xs text-[#8fb0d6] truncate">
                      {activeItem.subtitle}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => closeZoom()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#e4efff] bg-[#1b3456] hover:bg-[#254673] border border-[#3d6596] transition-colors shadow-sm"
                  title="Fermer (Touche Échap)"
                >
                  <X size={15} />
                  <span>Fermer</span>
                  <kbd className="hidden sm:inline-block text-[10px] bg-[#0c1b30] text-[#8fb0d6] px-1.5 py-0.5 rounded border border-[#2d4d73]">
                    Échap
                  </kbd>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 flex-1 min-h-0 flex flex-col items-center justify-center overflow-auto bg-[#060e1a]/60">
              {activeItem.type === 'chart' ? (
                <div className="zoomed-chart-viewport w-full h-[450px] sm:h-[480px]">
                  <div className="zoomed-chart-inner w-full h-full">
                    {activeItem.content}
                  </div>
                </div>
              ) : (
                <div className="zoomed-image-viewport w-full flex flex-col items-center justify-center p-2">
                  <div className="bg-white p-3 sm:p-4 rounded-xl shadow-2xl max-w-4xl max-h-[58vh] flex items-center justify-center border border-[#355c8c]">
                    <img
                      src={activeItem.imageSrc}
                      alt={activeItem.title}
                      className="max-h-[52vh] w-auto max-w-full object-contain rounded"
                    />
                  </div>
                  {activeItem.imageDesc && (
                    <p className="mt-3 text-xs sm:text-sm text-[#a8c6e8] max-w-2xl text-center bg-[#0d213b] px-4 py-2 rounded-lg border border-[#24456e]">
                      {activeItem.imageDesc}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-2.5 border-t border-[#1e3859] bg-[#081526] flex items-center justify-between text-[11px] text-[#7d9ebf]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#73d9bb] animate-pulse" />
                <span>Survolez les courbes ou barres pour inspecter les valeurs exactes.</span>
              </div>
              <div className="flex items-center gap-3">
                <span>Cliquez en dehors ou sur Fermer [Échap]</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
