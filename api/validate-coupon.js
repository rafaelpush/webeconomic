import express from "express";
const router = express.Router();

// Exemplo de cupons (em produção você pegaria do banco)
const coupons = [
  {
    code: "WECONOMIA2025RJSPSLV",
    type: "percent",
    value: 10,
    expiresAt: "2025-11-30T23:59:59Z" // ISO string
  },
  {
    code: "WBSILVATLGDQQPPSHG",
    type: "fixed",
    value: 5,
    expiresAt: "2025-11-30T23:59:59Z"
  }
];

// POST /api/validate-coupon
router.post("/", (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ valid: false, message: "Informe um cupom." });

  const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
  if (!coupon) return res.json({ valid: false, message: "Cupom não encontrado." });

  const now = new Date();
  if (new Date(coupon.expiresAt) < now) {
    return res.json({ valid: false, message: "Cupom expirado." });
  }

  // retorna cupom válido com dados necessários
  return res.json({ valid: true, coupon });
});

export default router;
