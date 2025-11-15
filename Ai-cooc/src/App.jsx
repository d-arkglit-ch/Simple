import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import RecipeGenerator from "./RecipeGenerator";

function App() {
  const [user, setUser] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [newIng, setNewIng] = useState("");
  const [recipes, setRecipes] = useState([]);

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
    else alert("Check your email for a login link.");
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  async function loadIngredients() {
    const { data, error } = await supabase
      .from("ingredients")
      .select("id, name")
      .order("created_at", { ascending: false });

    if (!error) setIngredients(data.map(d => d.name));
  }

  async function loadRecipes() {
    const { data, error } = await supabase
      .from("recipes")
      .select("id, title, recipe_text, ingredients, created_at")
      .order("created_at", { ascending: false });

    if (!error) setRecipes(data);
  }

  async function addIngredient() {
    if (!newIng.trim()) return;
    const { data: { user: curUser } } = await supabase.auth.getUser();
    if (!curUser) return alert("Please login first.");

    const { error } = await supabase.from("ingredients").insert([{
      name: newIng.trim(),
      user_id: curUser.id
    }]);

    if (error) return alert("Insert failed: " + error.message);
    setNewIng("");
    loadIngredients();
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Ingredient → Simple Recipe
      </h1>

      {!user ? (
        <button
          onClick={signIn}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
        >
          Login (Magic Link)
        </button>
      ) : (
        <>
          {/* Logged In User Info */}
          <div className="flex items-center gap-4 mb-6">
            <p className="text-gray-700">
              Logged in as: <b>{user.email}</b>
            </p>
            <button
              onClick={signOut}
              className="px-4 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm"
            >
              Sign out
            </button>
          </div>

          {/* Add Ingredient */}
          <div className="flex gap-3 mb-6">
            <input
              value={newIng}
              onChange={(e) => setNewIng(e.target.value)}
              placeholder="Add ingredient (e.g., tomato)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
            />
            <button
              onClick={addIngredient}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
            >
              Add
            </button>
          </div>

          {/* Ingredient List */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Your Ingredients</h3>
            <div className="text-gray-700">
              {ingredients.length ? ingredients.join(", ") : "No ingredients yet."}
            </div>
          </div>

          {/* Recipe Generator */}
          <div className="mb-10">
            <RecipeGenerator
              ingredients={ingredients}
              user={user}
              onSaved={() => {
                loadRecipes();
                loadIngredients();
              }}
            />
          </div>

          {/* Saved Recipes */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Your Saved Recipes
            </h3>

            {recipes.length === 0 && (
              <div className="text-gray-600">No saved recipes yet.</div>
            )}

            {recipes.map(r => (
              <div
                key={r.id}
                className="border border-gray-300 rounded-lg p-4 mb-4 shadow-sm bg-white"
              >
                <strong className="text-lg text-gray-900">{r.title}</strong>
                <div className="text-sm text-gray-500 mb-2">
                  {r.ingredients?.join(", ")}
                </div>
                <pre className="whitespace-pre-wrap text-gray-800 mb-2">
                  {r.recipe_text}
                </pre>
                <small className="text-gray-500">
                  {new Date(r.created_at).toLocaleString()}
                </small>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
