import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Get all products (with category)
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(name)")
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single product
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return res.status(404).json({ error: error.message });
  res.json({ data });
});

// Create product
router.post("/", async (req, res) => {
  const payload = req.body;
  const { data, error } = await supabase
    .from("products")
    .insert(payload)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ data });
});

// Update product
router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const payload = req.body;
  const { data, error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ data });
});

// Delete product
router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

// Bulk offline data sync
router.post("/sync", async (req, res) => {
  const items = req.body.items || [];
  if (!Array.isArray(items))
    return res.status(400).json({ error: "items must be an array" });

  try {
    const toInsert = items.map((it) => ({
      name: it.name,
      description: it.description,
      price: it.price,
      category_id: it.category_id,
    }));

    console.log(toInsert);

    const { data: inserted, error } = await supabase
      .from("products")
      .insert(toInsert)
      .select();

    if (error) return res.status(500).json({ error: error.message });

    // map tempId -> server row
    const mapping = items.map((it, i) => ({
      tempId: it.tempId,
      serverRow: inserted[i],
    }));

    res.json({ mapping, inserted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
