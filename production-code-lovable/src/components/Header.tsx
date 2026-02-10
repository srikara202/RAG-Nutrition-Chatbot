import { motion } from 'framer-motion';
import { Sparkles, Heart, Leaf } from 'lucide-react';

export function Header() {
  return (
    <header className="relative py-6 px-4 text-center border-b border-border bg-card/50 backdrop-blur-sm">
      {/* Decorative elements */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="absolute left-8 top-1/2 -translate-y-1/2 hidden md:block"
      >
        <Leaf className="w-8 h-8 text-primary/30" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:block"
      >
        <Heart className="w-8 h-8 text-accent/30" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <h1 className="font-display text-2xl md:text-3xl font-bold text-gradient">
            RAG Nutritional Chatbot
          </h1>
          <Sparkles className="w-6 h-6 text-accent" />
        </div>
        
        <p className="text-sm text-muted-foreground mb-1">
          Built from Scratch
        </p>
        
        <p className="text-xs text-muted-foreground/70">
          Presented by <span className="font-semibold text-primary">Srikara</span>
        </p>
      </motion.div>
    </header>
  );
}