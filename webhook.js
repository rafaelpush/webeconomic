import mercadopago from "mercadopago";
import admin from "firebase-admin";

// Inicializa Firebase Admin apenas uma vez
if (!admin.apps.length) {
  // Lê Firebase Admin da variável de ambiente (Base64 seguro)
  const firebaseAdmin = JSON.parse(
    Buffer.from(process.env.FIREBASE_ADMIN, "base64").toString("utf-8")
  );

  admin.initializeApp({
    credential: admin.credential.cert(firebaseAdmin),
  });
}

export default async function handler(req, res) {
  try {
    const data = req.body;

    // Ignorar eventos que não são pagamento
    if (data.type !== "payment") return res.status(200).send("ignored");

    const paymentId = data.data.id;

    // Buscar pagamento usando access_token
    const info = await mercadopago.payment.findById(paymentId, {
      access_token: process.env.MP_ACCESS_TOKEN,
    });

    const payment = info.body;

    if (payment.status === "approved") {
      const [uid, plano] = payment.external_reference.split("|");

      // Atualiza plano do usuário no Firestore
      await admin
        .firestore()
        .collection("users")
        .doc(uid)
        .set({ plan: plano }, { merge: true });
    }

    res.status(200).send("ok");
  } catch (err) {
    console.error("Erro webhook:", err);
    res.status(500).send("erro");
  }
}
