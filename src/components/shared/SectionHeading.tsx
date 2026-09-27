import { motion } from 'framer-motion';

interface SectionHeadingProps {
  title: string;
  highlight: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeading({ title, highlight, subtitle, className = '' }: SectionHeadingProps) {
  // Split title around the highlight to properly render the gradient part
  const parts = title.split(highlight);
  
  return (
    <div className={`text-center max-w-3xl mx-auto ${className}`}>
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
      >
        {parts.length > 1 ? (
          <>
            {parts[0]}
            <span className="ht-gradient-text">{highlight}</span>
            {parts[1]}
          </>
        ) : (
          title
        )}
      </motion.h2>
      
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-slate-400 text-lg md:text-xl"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
export default SectionHeading;
