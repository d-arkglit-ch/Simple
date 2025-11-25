import React from "react";

export default function RecipeModal({ recipe, onClose }) {
  if (!recipe) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-[#1e293b] w-full max-w-2xl rounded-2xl shadow-2xl relative border border-white/10 overflow-hidden animate-scale-in">
        
        {/* Header Image / Gradient */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-cyan-600 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-colors backdrop-blur-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="absolute -bottom-6 left-8 bg-[#1e293b] p-2 rounded-xl shadow-lg">
             <span className="text-4xl">🍲</span>
          </div>
        </div>

        <div className="pt-10 px-8 pb-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          <h2 className="text-3xl font-bold text-white mb-2">
            {recipe.title}
          </h2>
          
          <div className="flex gap-2 mb-6">
             {recipe.ingredients?.slice(0, 3).map((ing, i) => (
                <span key={i} className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full border border-blue-500/20">
                  {ing}
                </span>
             ))}
             {recipe.ingredients?.length > 3 && (
               <span className="text-xs text-gray-500 py-1">+ {recipe.ingredients.length - 3} more</span>
             )}
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Ingredients Column */}
            <div className="md:col-span-1 bg-black/20 rounded-xl p-4 h-fit">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Ingredients</h4>
              <ul className="space-y-2">
                {recipe.ingredients?.map((ing, i) => (
                  <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span> {ing}
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions Column */}
            <div className="md:col-span-2">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Instructions</h4>
              <div className="prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-gray-300 font-sans text-base leading-relaxed">
                  {recipe.recipe_text}
                </pre>
              </div>
            </div>

          </div>

        </div>
        
        <div className="bg-black/20 px-8 py-4 border-t border-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
