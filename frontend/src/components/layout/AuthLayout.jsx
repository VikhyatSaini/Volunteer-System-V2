import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

const AuthLayout = () => {
  const location = useLocation();
  const isRegister = location.pathname === '/register';

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center"
      >
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"></div>
      </div>

      {/* 3D Scene Container */}
      {/* perspective-1500px creates a realistic 'card' depth */}
      <div className="w-full max-w-5xl relative z-10" style={{ perspective: '1500px' }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            // --- 3D CARD FLIP / NOTEBOOK LOGIC ---
            // If going to Register: Old page flips Left (-90), New page enters from Right (90)
            // If going to Login: Old page flips Right (90), New page enters from Left (-90)
            initial={{ 
              rotateY: isRegister ? 90 : -90, 
              opacity: 0,
              scale: 0.95 
            }}
            animate={{ 
              rotateY: 0, 
              opacity: 1,
              scale: 1 
            }}
            exit={{ 
              rotateY: isRegister ? -90 : 90, 
              opacity: 0,
              scale: 0.95 
            }}
            transition={{ 
              duration: 0.6, 
              ease: [0.645, 0.045, 0.355, 1.000], // Smooth cubic-bezier
            }}
            style={{ 
              transformStyle: 'preserve-3d', 
              transformOrigin: 'center', // Flips around the spine
              backfaceVisibility: 'hidden'
            }}
            className="w-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuthLayout;