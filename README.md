# 🏎️ Speedhunters Telegram Bot

This bot scrapes the latest article from [speedhunters.com](https://www.speedhunters.com) and posts it to a specified Telegram channel — complete with image, title, and link.

It uses:
- 🔎 Express for HTTP handling (Gen 2 GCP functions)
- 📦 Firestore to avoid reposting the same content
- 🤖 Telegram Bot API
- ☁️ Google Cloud Functions Gen 2

---

## 🚀 Features

- Scrapes Speedhunters homepage for the latest post
- Sends a Telegram message with title, image, and link
- Stores last sent post in Firestore to prevent duplicates
- Scheduled execution via Cloud Scheduler
- Fully deployable on **GCP Cloud Functions Gen 2**

---

## 🧰 Local Setup

### 1. Clone the Repo

```bash
git clone https://github.com/mvmisha/Speedhunters-Telegram-Bot.git
cd Speedhunters-Telegram-Bot
npm install
```

### 2. Create `.env`

```env
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=@your_channel_or_chat_id
COLLECTION_NAME=published_posts
```

### 3. Run Locally

```bash
npm start
```

Visit [http://localhost:8080](http://localhost:8080) to test.

---

## ☁️ Deploy to Google Cloud Functions (Gen 2)

### 1. Enable GCP APIs

- Cloud Functions
- Firestore (Native Mode)
- Cloud Build
- Cloud Scheduler (optional)

### 2. Create Firestore Database

Go to [Firebase Console](https://console.firebase.google.com/) → Select your project → **Firestore**  
- Choose **Native mode**
- Select a region (e.g. `europe-west1`)

### 3. Deploy the Function

```powershell
gcloud functions deploy myFunctionName `
  --gen2 `
  --runtime=nodejs20 `
  --region=europe-west1 `
  --trigger-http `
  --entry-point=app `
  --allow-unauthenticated `
  --set-env-vars "TELEGRAM_BOT_TOKEN=...,TELEGRAM_CHAT_ID=...,COLLECTION_NAME=published_posts"
```

✅ Note: Remove `--allow-unauthenticated` to make it private.

---

## ⏰ (Optional) Schedule It Every 6 Hours

```powershell
gcloud scheduler jobs create http myScheduledJob `
  --schedule "0 */6 * * *" `
  --time-zone "UTC" `
  --uri "https://REGION-PROJECT_ID.cloudfunctions.net/myFunctionName" `
  --http-method GET `
  --oidc-service-account-email=SERVICE_ACCOUNT@YOUR_PROJECT.iam.gserviceaccount.com
```

---

## 🔐 Calling a Private Function with Identity Token

If you disable `--allow-unauthenticated`, you'll need to call it like this:

```powershell
$token = gcloud auth print-identity-token
curl -H "Authorization: Bearer $token" `
     "https://REGION-PROJECT_ID.cloudfunctions.net/myFunctionName"
```

Or use the included script:

```bash
node getIdentityToken.js
```

---

## 📁 Project Structure

```bash
.
├── src/
│   ├── index.js              # Express app
│   ├── sendLatestPost.js     # Scraper & Telegram logic
│   └── getIdentityToken.js   # Utility to get OIDC token
│
├── server.js                 # Local dev entry point
├── .env                      # Local environment vars
├── .gitignore
├── .gcloudignore
└── package.json
```

---

## 🛡 Security Tips

- Never commit `.env` or `serviceAccount.json`
- Store all secrets in **GCP environment variables**
- Disable `--allow-unauthenticated` for private deployments
- Use IAM roles: `Cloud Functions Invoker` and `Firestore User`

---

## 📬 Telegram Setup

1. [Create a Bot](https://t.me/BotFather)
2. Copy the bot token
3. Add your bot to the Telegram channel as an **admin**
4. Use `@yourchannelusername` as `TELEGRAM_CHAT_ID`

---

## 📄 License

MIT – built by [@mvmisha](https://github.com/mvmisha) for fun and fast cars 🏁