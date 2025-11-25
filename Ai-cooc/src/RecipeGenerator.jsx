import React, { useState } from "react";

export default function RecipeGenerator({ ingredients = [], user, onSaved = () => {} }) {
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState(null);

  async function handleGenerate() {
    if (!user) return alert("Please login first.");
    if (!ingredients.length) return alert("Add at least one ingredient.");
    
    setLoading(true);

    try {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          ingredients,
        }),
      });

      const json = await resp.json();
      if (resp.ok) {
        setRecipe({ title: json.title, text: json.recipe_text });
        onSaved();
      } else {
        alert("Failed: " + (json.error || "Unknown"));
      }
    } catch (err) {
      console.error(err);
      alert("Network/server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="text-blue-400">2.</span> Generate Recipe
      </h3>

      <p className="text-gray-400 text-sm mb-6">
        Ready to cook? Our AI will analyze your ingredients and create a custom recipe just for you.
      </p>

      {/* Button */}
      <button
        onClick={handleGenerate}
        disabled={loading || ingredients.length === 0}
        className={`w-full py-3 rounded-xl font-bold text-lg transition-all shadow-lg ${
          ingredients.length === 0 || loading
            ? "bg-gray-700 text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:scale-[1.02]"
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Chef is thinking...
          </span>
        ) : (
          "✨ Generate Recipe"
        )}
      </button>

      {/* Show recipe */}
      {recipe && (
        <div className="mt-8 animate-fade-in">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-4 flex items-center gap-3">
            <span className="text-green-400 text-xl">✓</span>
            <div>
              <h4 className="font-bold text-green-400">Recipe Generated!</h4>
              <p className="text-sm text-green-300/80">Saved to your cookbook.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
