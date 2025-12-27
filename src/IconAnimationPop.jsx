import { motion, AnimatePresence } from "framer-motion";

export default function IconAnimationPop({ icon }) {
  return (
    <AnimatePresence>
      {icon && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          pointerEvents: "none"
        }}>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            style={{ fontSize: "100px" }}
          >
            {icon}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}