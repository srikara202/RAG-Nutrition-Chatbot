import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export function Disclaimer() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="flex items-center justify-center gap-2 py-3 px-4 bg-muted border-t border-border"
    >
      <AlertTriangle className="w-4 h-4 text-citation flex-shrink-0" />
      <p className="text-xs text-muted-foreground text-center">
        <strong className="text-foreground">Disclaimer:</strong> This chatbot is for educational purposes only. 
        Always consult a healthcare professional for medical advice.
      </p>
    </motion.div>
  );
}