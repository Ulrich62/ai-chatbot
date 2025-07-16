import { motion } from "framer-motion";
import Image from "next/image";

export const Greeting = () => {
  const initialMessage =
    "Revoir un concept, créer un script, clarifier une règle ?";
  const description =
    "Posez votre question, My Binhas vous guide en s'appuyant sur notre méthode et notre expertise.";
  return (
    <div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20 px-8 size-full flex flex-col justify-center"
    >
      <Image
        src="/images/icone.png"
        alt="My Binhas Logo"
        width={80}
        height={80}
        className="mx-auto mb-6"
        priority
      />
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
