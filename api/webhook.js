import mercadopago from "mercadopago";
import admin from "firebase-admin";

mercadopago.configure({ access_token: process.env.MP_ACCESS_TOKEN });

if (!admin.apps.length) {
  const firebaseAdmin = JSON.parse(
    Buffer.from(process.env.FIREBASE_ADMIN, "base64").toString("utf-8")
  );
  admin.initializeApp({ credential: admin.credential.cert(firebaseAdmin) });
}

export default async function webhook(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  try {
    const data = req.body;

    if (!data || !["payment", "payment.updated"].includes(data.type))
      return res.status(200).send("ignored");

    const paymentId = data.data.id;
    const info = await mercadopago.payment.findById(paymentId);
    const payment = info.body;

    if (payment.status === "approved") {
      const [uid, plano] = payment.external_reference.split("|");

      await admin.firestore()
        .collection("users")
        .doc(uid)
        .set({ plan: plano }, { merge: true });
    }

    return res.status(200).send("ok");

  } catch (err) {
    console.error("Erro webhook:", err);
    return res.status(500).send("erro");
  }
}
