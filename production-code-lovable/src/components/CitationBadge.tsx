import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText } from 'lucide-react';

interface Source {
  id: number;
  index: number;
  page: number | null;
  content: string;
  similarity: number;
}

interface CitationBadgeProps {
  citationNumber: number;
  source: Source;
}

export function CitationBadge({ citationNumber, source }: CitationBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="citation-badge inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full bg-citation text-citation-foreground hover:opacity-80 transition-opacity cursor-pointer mx-0.5 align-super"
        title={`View source ${citationNumber}`}
      >
        {citationNumber}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />

            {/* Popup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-lg"
            >
              <div className="bg-card rounded-xl shadow-medium border border-border overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border bg-secondary">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-citation text-citation-foreground font-bold">
                      {citationNumber}
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-foreground">
                        Source Citation
                      </h3>
                      {source.page && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          Page {source.page}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 max-h-[50vh] overflow-y-auto">
                  <div className="bg-secondary rounded-lg p-4 border-l-4 border-citation">
                    <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                      {source.content}
                    </p>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      Similarity: {(source.similarity * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}