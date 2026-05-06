import { motion } from "motion/react";

export function BackgroundBlobs() {
  return (
    <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
      {/* The background image with an overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.15 }}
          transition={{ duration: 2 }}
          src="https://chatgpt.com/backend-api/estuary/content?id=file_00000000e5e07207af4db8322bb95696&ts=493910&p=fs&cid=1&sig=cfac51faf4a329d0eb4eef85a23ba00d9e2d262c8af19234b5ac89372281e0a0&v=0" 
          alt="Background" 
          className="w-full h-full object-cover filter brightness-50"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/80 to-black" />
      </div>

      <motion.div
        className="blob"
        animate={{
          x: [0, 100, -50, 0],
          y: [0, 50, 100, 0],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ top: "10%", left: "10%", background: "radial-gradient(circle, rgba(79, 70, 229, 0.4) 0%, transparent 70%)" }}
      />
      <motion.div
        className="blob"
        animate={{
          x: [0, -100, 50, 0],
          y: [0, -50, -100, 0],
          scale: [1, 0.8, 1.2, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ bottom: "10%", right: "10%", background: "radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)" }}
      />
      <motion.div
        className="blob"
        animate={{
          x: [0, 50, -100, 0],
          y: [0, 100, 50, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ top: "40%", right: "20%", background: "radial-gradient(circle, rgba(14, 165, 233, 0.4) 0%, transparent 70%)" }}
      />
    </div>
  );
}
