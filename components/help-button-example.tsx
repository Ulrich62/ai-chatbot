"use client";

import HelpButton from "./help-button";

export default function HelpButtonExample() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-teal-500 relative">
      {/* Contenu principal de la page */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-8">
            Découvrez VictorIA, l&apos;assistante virtuelle qui vous accompagne
            dans votre projet de territoire.
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center">
              Vous êtes candidat
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            <button className="bg-white text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center">
              Vous êtes un citoyen
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Bouton d'aide flottant */}
      <HelpButton />
    </div>
  );
}
