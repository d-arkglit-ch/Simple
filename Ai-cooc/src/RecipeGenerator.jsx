import React, { useState } from "react";

export default function RecipeGenerator({ ingredients = [], user, onSaved = () => {} }) {
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState(null);

  async function handleGenerate() {
    if (!user) return alert("Please login first.");
    if (!ingredients.length) return alert("Add at least one ingredient.");
console.log("USER:", user);
console.log("INGREDIENTS:", ingredients);
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
    <div className="bg-white border border-gray-200 rounded-xl shadow p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-3">
        Generate a Super-Simple Recipe
      </h3>

      {/* Button */}
      <button
        onClick={handleGenerate}
        disabled={loading || ingredients.length === 0}
        className={`px-5 py-2 rounded-md text-white font-medium transition ${
          ingredients.length === 0 || loading
            ? "bg-blue-300 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Generating..." : "Generate & Save Recipe"}
      </button>

      {/* Show recipe */}
      {recipe && (
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-5">
          <h4 className="text-lg font-bold text-gray-900 mb-2">{recipe.title}</h4>
          <pre className="whitespace-pre-wrap text-gray-700">
            {recipe.text}
          </pre>
        </div>
      )}
    </div>
  );
}
