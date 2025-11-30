import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/vincular", async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) return res.json({ success: false, error: "Missing code" });

    return res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.json({ success: false, error: err.message });
  }
});

export default router;
