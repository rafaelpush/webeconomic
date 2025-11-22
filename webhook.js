import mercadopago from "mercadopago";
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN)),
  });
}

// Configura token
mercadopago.configurations.setAccessToken(process.env.MP_ACCESS_TOKEN);

export default async function handler(req, res) {
  try {
    const data = req.body;

    if (data.type !== "payment") return res.status(200).send("ignored");

    const paymentId = data.data.id;
    const info = await mercadopago.payment.get(paymentId); // use get() em vez de findById()

    const payment = info.response;

    if (payment.status === "approved") {
      const [uid, plano] = payment.external_reference.split("|");

      await admin.firestore().collection("users").doc(uid).set(
        { plan: plano },
        { merge: true }
      );
    }

    res.status(200).send("ok");
  } catch (err) {
    console.error(err);
    res.status(500).send("erro");
  }
}
