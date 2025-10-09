import bodyParser from "body-parser";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const { handleMessage } = await import("./chat.js");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/whatsapp", async (req, res) => {
  try {
    const from = req.body.From || "unknown";
    const body = req.body.Body || "";

    const reply = await handleMessage(from, body);

    res.set("Content-Type", "text/xml");
    res.send(`
      <Response>
        <Message>${reply}</Message>
      </Response>
    `);
  } catch (err) {
    console.error("Error handling message:", err);
    res.status(500).send("Internal Server Error");
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
