import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import RecipeGenerator from "./RecipeGenerator";
import RecipeModal from "./RecipeModal";

function App() {
  const [user, setUser] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [newIng, setNewIng] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) setUser(session.user);
    })();
  }, []);

  useEffect(() => {
    if (!user) return;
    loadIngredients();
    loadRecipes();
  }, [user]);

  async function signIn() {
    const email = prompt("Enter your email for magic link:");
    if (!email) return;
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) alert(error.message);
    else alert("Check your email!");
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  async function loadIngredients() {
    const { data, error } = await supabase
      .from("ingredients")
      .select("id, name");

    if (!error) setIngredients(data.map(d => d.name));
  }

  async function loadRecipes() {
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      const normalized = data.map(r => ({
        ...r,
        ingredients: typeof r.ingredients === "string"
          ? JSON.parse(r.ingredients)
          : r.ingredients
      }));
      setRecipes(normalized);
    }
  }

  async function addIngredient() {
    if (!newIng.trim()) return;
    const { data: { user: curUser } } = await supabase.auth.getUser();

    const { error } = await supabase.from("ingredients").insert([
      { name: newIng.trim(), user_id: curUser.id }
    ]);

    if (!error) {
      setNewIng("");
      loadIngredients();
    }
  }

  async function clearIngredientsFromDB() {
    const { data: { user: curUser } } = await supabase.auth.getUser();
    await supabase.from("ingredients").delete().eq("user_id", curUser.id);
  }

  return (
    <div className="min-h-screen text-gray-200 pb-20">
      
      {/* Header */}
      <header className="glass sticky top-0 z-40 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍳</span>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              AI Cooks
            </h1>
          </div>
          
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400 hidden sm:block">{user.email}</span>
              <button
                onClick={signOut}
                className="px-4 py-1.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-full transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={signIn}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-full transition-all shadow-lg shadow-blue-500/20"
            >
              Login
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Modal */}
        <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />

        {!user ? (
          <div className="text-center py-20">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Turn Ingredients into Masterpieces
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Don't know what to cook? Just enter the ingredients you have, and let our AI chef create a delicious recipe for you in seconds.
            </p>
            <button
              onClick={signIn}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-full text-lg transition-all shadow-xl shadow-blue-500/25 transform hover:scale-105"
            >
              Get Started for Free
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-12">
            
            {/* Left Column: Input & Generator */}
            <div className="lg:col-span-5 space-y-8">
              
              {/* Ingredients Input */}
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="text-blue-400">1.</span> Add Ingredients
                </h3>
                
                <div className="flex gap-2 mb-4">
                  <input
                    value={newIng}
                    onChange={(e) => setNewIng(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
                    placeholder="e.g., Chicken, Rice, Tomato..."
                    className="flex-1 px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder-gray-500"
                  />
                  <button
                    onClick={addIngredient}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors font-medium"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 min-h-[60px]">
                  {ingredients.length > 0 ? (
                    ingredients.map((ing, i) => (
                      <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300">
                        {ing}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic w-full text-center py-4">
                      No ingredients added yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Generator Component */}
              <RecipeGenerator
                ingredients={ingredients}
                user={user}
                onSaved={async () => {
                  await loadRecipes();
                  await clearIngredientsFromDB();
                  setIngredients([]);
                  setNewIng("");
                }}
              />
            </div>

            {/* Right Column: Saved Recipes */}
            <div className="lg:col-span-7">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Your Cookbook</h3>
                <span className="text-sm text-gray-400">{recipes.length} recipes saved</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {recipes.map(r => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRecipe(r)}
                    className="glass glass-hover p-5 rounded-2xl cursor-pointer transition-all group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-lg text-blue-400 group-hover:text-blue-300 transition-colors line-clamp-1">
                        {r.title}
                      </h3>
                      <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full border border-blue-500/20">
                        AI Generated
                      </span>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2 h-10">
                      {r.ingredients.join(", ")}
                    </p>
                    
                    <div className="flex items-center text-xs text-gray-500 border-t border-white/5 pt-3 mt-auto">
                      <span>View Recipe</span>
                      <span className="ml-auto">→</span>
                    </div>
                  </div>
                ))}
                
                {recipes.length === 0 && (
                  <div className="col-span-full text-center py-12 border-2 border-dashed border-white/10 rounded-2xl">
                    <p className="text-gray-500">No recipes saved yet. Generate one!</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

export default App;
