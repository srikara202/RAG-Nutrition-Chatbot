import { motion } from 'framer-motion';
import { Apple, Pill, Utensils, Droplets } from 'lucide-react';

interface WelcomeMessageProps {
  onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
  { icon: Apple, text: "What are the main food groups?", colorClass: "text-destructive" },
  { icon: Pill, text: "Tell me about vitamins", colorClass: "text-primary" },
  { icon: Utensils, text: "How does digestion work?", colorClass: "text-accent" },
  { icon: Droplets, text: "Why is hydration important?", colorClass: "text-primary" },
];

export function WelcomeMessage({ onSuggestionClick }: WelcomeMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.2 }}
        className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mb-6 shadow-glow"
      >
        <span className="text-4xl">🥗</span>
      </motion.div>

      <h2 className="font-display text-xl font-semibold text-foreground mb-2 text-center">
        Welcome to Your Nutrition Assistant!
      </h2>
      
      <p className="text-muted-foreground text-center max-w-md mb-8">
        I'm here to help you learn about nutrition from a comprehensive textbook. 
        Ask me anything about vitamins, minerals, digestion, and more!
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={suggestion.text}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            onClick={() => onSuggestionClick(suggestion.text)}
            className="flex items-center gap-3 p-4 rounded-xl bg-card hover:bg-secondary border border-border hover:border-primary/30 transition-all duration-200 text-left group shadow-soft hover:shadow-medium"
          >
            <suggestion.icon className={`w-5 h-5 ${suggestion.colorClass} group-hover:scale-110 transition-transform`} />
            <span className="text-sm text-foreground">{suggestion.text}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}