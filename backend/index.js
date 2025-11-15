import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICES_ROLE_KEY = process.env.SUPABASE_SERVICES_ROLE_KEY;

const supaAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICES_ROLE_KEY);
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

app.post("/generate", async (req, res) => {
  try {
    const { user_id, ingredients } = req.body;
    if (!user_id || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res
        .status(400)
        .json({ error: "user_id and ingredients[] required" });
    }

  const prompt = `
You are a friendly cooking assistant.
Using ONLY these ingredients: ${ingredients.join(", ")}, plus basics like salt, oil, and water,
create a very simple recipe.

Include:
- A short title
- A 1–2 line description
- Ingredients list
- 4–6 very simple steps
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    console.log(response);

    const text =  response.text;

    const [titleLine, ...rest] = text
      .trim()
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const recipe_text = rest.join("\n");

    const { data, error: inserError } = await supaAdmin.from("recipes").insert([
      {
        user_id,
        title: titleLine || "simple recipe",
        ingredients:JSON.stringify(ingredients),
        recipe_text,
      },
    ]);

    if (inserError) {
      return res.status(500).json({ error: "failed to save the recipe" });
    }

    return res.status(200).json({
      title: titleLine || "simple recipe",
      recipe_text,
      saved: true,
      id: data?.[0]?.id ?? null,
    });
  } catch (error) {
    console.error("generate error", error);
    return res.status(500).json({ error: "server error" });
  }
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("good day young one ");
});
