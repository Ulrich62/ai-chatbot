import { motion } from "framer-motion";

export const Greeting = () => {
  const initialMessage = "Bienvenue dans l'assistant de Binhas";
  const description =
    "Je suis l'assistant de Binhas, je peux t'aider à trouver des informations dont tu as besoin";
  return (
    <div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20 px-8 size-full flex flex-col justify-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
        className="text-2xl font-semibold"
      >
        {initialMessage}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6 }}
        className="text-2xl text-zinc-500"
      >
        {description}
      </motion.div>
    </div>
  );
};
