import bodyParser from "body-parser";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const { handleMessage } = await import("./chat.js");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Health check / status endpoint
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Barbershop AI - WhatsApp Bot</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          max-width: 800px;
          margin: 50px auto;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        h1 { margin-top: 0; font-size: 2.5em; }
        .status { 
          background: #10b981; 
          display: inline-block;
          padding: 10px 20px;
          border-radius: 25px;
          font-weight: bold;
          margin: 20px 0;
        }
        .info { 
          background: rgba(255, 255, 255, 0.1);
          padding: 20px;
          border-radius: 10px;
          margin: 20px 0;
        }
        .endpoint { 
          font-family: monospace;
          background: rgba(0, 0, 0, 0.3);
          padding: 10px;
          border-radius: 5px;
          margin: 10px 0;
        }
        ul { line-height: 1.8; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>💈 Barbershop AI Bot</h1>
        <div class="status">✓ Server Running</div>
        
        <div class="info">
          <h2>📡 Webhook Endpoint</h2>
          <div class="endpoint">POST ${req.protocol}://${req.get('host')}/whatsapp</div>
          <p>Configure this URL in your Twilio Console for WhatsApp messages.</p>
        </div>

        <div class="info">
          <h2>⚙️ Configuration Status</h2>
          <ul>
            <li>✓ Express Server: Running</li>
            <li>${process.env.OPENAI_API_KEY ? '✓' : '✗'} OpenAI API Key: ${process.env.OPENAI_API_KEY ? 'Configured' : 'Missing'}</li>
            <li>${process.env.RESERVIO_API_KEY ? '✓' : '✗'} Reservio API Key: ${process.env.RESERVIO_API_KEY ? 'Configured' : 'Missing'}</li>
            <li>${process.env.DATABASE_URL ? '✓' : '✗'} Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}</li>
            <li>🌍 Timezone: ${process.env.BUSINESS_TIMEZONE || 'Not set'}</li>
          </ul>
        </div>

        <div class="info">
          <h2>🚀 Getting Started</h2>
          <ol>
            <li>Use <strong>ngrok</strong> to expose this server: <code>ngrok http ${process.env.PORT || 4000}</code></li>
            <li>Copy the ngrok URL and add <code>/whatsapp</code> to it</li>
            <li>Configure the webhook in Twilio Console</li>
            <li>Send a WhatsApp message to test!</li>
          </ol>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Info page for the webhook endpoint
app.get("/whatsapp", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>WhatsApp Webhook Endpoint</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          max-width: 700px;
          margin: 50px auto;
          padding: 20px;
          background: #f3f4f6;
        }
        .container {
          background: white;
          border-radius: 10px;
          padding: 40px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        h1 { color: #1f2937; margin-top: 0; }
        .info-box {
          background: #dbeafe;
          border-left: 4px solid #3b82f6;
          padding: 15px;
          margin: 20px 0;
          border-radius: 5px;
        }
        code {
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: monospace;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📱 WhatsApp Webhook Endpoint</h1>
        
        <div class="info-box">
          <p><strong>ℹ️ This is a webhook endpoint</strong></p>
          <p>This endpoint only accepts <strong>POST</strong> requests from Twilio WhatsApp.</p>
          <p>You cannot view it directly in a browser (which sends GET requests).</p>
        </div>

        <h3>✅ Webhook is Active</h3>
        <p>This endpoint is ready to receive WhatsApp messages from Twilio.</p>

        <h3>🔧 Configuration</h3>
        <p>Set this URL in your Twilio Console:</p>
        <code>POST ${req.protocol}://${req.get('host')}/whatsapp</code>

        <p style="margin-top: 30px;">
          <a href="/" style="color: #3b82f6; text-decoration: none;">← Back to Server Status</a>
        </p>
      </div>
    </body>
    </html>
  `);
});

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
