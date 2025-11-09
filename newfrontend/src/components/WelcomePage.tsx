import { ArrowRight, Sparkles, TrendingUp, Shield, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';

interface WelcomePageProps {
  onGetStarted: () => void;
}

export function WelcomePage({ onGetStarted }: WelcomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-sky-950 to-blue-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, -50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-600/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Animated Grid Pattern Overlay */}
      <motion.div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
        animate={{
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        {/* Logo */}
        <motion.div 
          className="mb-8 relative"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
            duration: 1
          }}
        >
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-sky-500 to-blue-500 blur-2xl opacity-50 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-sky-600 to-blue-600 flex items-center justify-center shadow-2xl"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <motion.span 
              className="text-4xl"
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              ✦
            </motion.span>
          </motion.div>
          {/* Wings - left and right small swings */}
          <div className="pointer-events-none">
            {/* Left wings group */}
            <div className="absolute left-[-70px] top-1/2 -translate-y-1/2">
              {/* 左翅膀 1 - 最小 (40px) - 尾部向上 */}
              <motion.svg width="50" height="40" viewBox="0 0 50 50"
                animate={{ opacity: 0.5, x: -2, rotate: -15, y: [0, -8, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}>
                <path d="M5 25 C15 5, 35 5, 45 25 C35 28, 15 28, 5 25 Z" fill="white" fillOpacity="0.35"/>
              </motion.svg>
              {/* 左翅膀 2 - 中等 (50px) - 水平 */}
              <motion.svg width="50" height="50" viewBox="0 0 50 50"
                animate={{ opacity: 0.7, x: 0, rotate: 0, y: [0, -8, 0] }}
                transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}>
                <path d="M5 25 C15 8, 35 8, 45 25 C35 30, 15 30, 5 25 Z" fill="white" fillOpacity="0.45"/>
              </motion.svg>
              {/* 左翅膀 3 - 最大 (60px) - 尾部向下 */}
              <motion.svg width="50" height="60" viewBox="0 0 50 60"
                animate={{ opacity: 1, x: 2, rotate: 15, y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}>
                <path d="M5 30 C15 12, 35 12, 45 30 C35 34, 15 34, 5 30 Z" fill="white" fillOpacity="0.6"/>
              </motion.svg>
            </div>
            {/* Right wings group (mirror) */}
            <div className="absolute right-[-70px] top-1/2 -translate-y-1/2">
              {/* 右翅膀 1 - 最小 (40px) - 尾部向上 */}
              <motion.svg width="50" height="40" viewBox="0 0 50 50"
                animate={{ opacity: 0.5, x: 2, rotate: 15, y: [0, -8, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}>
                <path d="M45 25 C35 5, 15 5, 5 25 C15 28, 35 28, 45 25 Z" fill="white" fillOpacity="0.35"/>
              </motion.svg>
              {/* 右翅膀 2 - 中等 (50px) - 水平 */}
              <motion.svg width="50" height="50" viewBox="0 0 50 50"
                animate={{ opacity: 0.7, x: 0, rotate: 0, y: [0, -8, 0] }}
                transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}>
                <path d="M45 25 C35 8, 15 8, 5 25 C15 30, 35 30, 45 25 Z" fill="white" fillOpacity="0.45"/>
              </motion.svg>
              {/* 右翅膀 3 - 最大 (60px) - 尾部向下 */}
              <motion.svg width="50" height="60" viewBox="0 0 50 60"
                animate={{ opacity: 1, x: -2, rotate: -15, y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}>
                <path d="M45 30 C35 12, 15 12, 5 30 C15 34, 35 34, 45 30 Z" fill="white" fillOpacity="0.6"/>
              </motion.svg>
            </div>
          </div>
        </motion.div>

        {/* Main Heading */}
        <div className="text-center max-w-4xl mb-12">
          <motion.div 
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-6 border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <motion.div
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <Sparkles className="h-4 w-4" />
            </motion.div>
            <span className="text-sm">Smart Credit, Unlimited Freedom</span>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl mb-6 bg-gradient-to-r from-white via-indigo-100 to-purple-100 bg-clip-text text-transparent leading-tight whitespace-nowrap"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Spend with <span className="font-semibold italic text-sky-300 text-[1.15em] align-baseline font-[Playfair]">Wings</span>, Land with Control
          </motion.h1>
          
          <motion.p 
            className="text-2xl text-slate-300 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            Stress-easing lending with smart alerts that keep your balance safe
          </motion.p>
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={onGetStarted}
            className="group h-16 px-12 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-lg rounded-2xl shadow-2xl shadow-sky-500/40 transition-all duration-300 border border-white/20 relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
                ease: "easeInOut"
              }}
            />
            <span className="mr-3 relative z-10">Get Started</span>
            <motion.div
              animate={{
                x: [0, 5, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative z-10"
            >
              <ArrowRight className="h-5 w-5" />
            </motion.div>
          </Button>
        </motion.div>

        {/* Feature Pills */}
        <motion.div 
          className="flex flex-wrap items-center justify-center gap-4 mt-16 max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
        >
          {[
            { icon: TrendingUp, text: 'Build Credit Smarter', color: 'text-sky-400', delay: 0 },
            { icon: Shield, text: 'Bank-Level Security', color: 'text-blue-400', delay: 0.1 },
            { icon: Zap, text: 'Instant Approvals', color: 'text-sky-400', delay: 0.2 },
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="flex items-center gap-2 bg-white/5 backdrop-blur-sm text-white px-5 py-3 rounded-full border border-white/10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 + feature.delay, duration: 0.5 }}
              whileHover={{ 
                scale: 1.05,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                transition: { duration: 0.2 }
              }}
            >
              <feature.icon className={`h-4 w-4 ${feature.color}`} />
              <span className="text-sm">{feature.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div 
          className="grid grid-cols-3 gap-12 mt-24 max-w-3xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
        >
          {[
            { value: '$2.5M+', label: 'Approved Credit', delay: 0 },
            { value: '10k+', label: 'Happy Users', delay: 0.1 },
            { value: '4.9★', label: 'User Rating', delay: 0.2 },
          ].map((stat, index) => (
            <motion.div 
              key={index}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 + stat.delay, duration: 0.5 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <motion.div 
                className="text-4xl mb-2 bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  delay: 1.6 + stat.delay,
                  type: "spring",
                  stiffness: 200,
                  damping: 15
                }}
              >
                {stat.value}
              </motion.div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent" />
    </div>
  );
}