# WP Deploy QA Pro — v2.0

Advanced WordPress Deployment Checklist System with full automation.

## What's New in v2.0

| Feature | Status |
|---|---|
| 🌗 Dark / Light mode toggle | ✅ |
| 🎉 Confetti on 100% completion | ✅ |
| 📱 Mobile responsive sidebar | ✅ |
| 📊 Dashboard with live charts | ✅ |
| 📄 PDF report download | ✅ |
| ✍️ Digital signature pad | ✅ |
| 💾 Auto-save every 30 seconds | ✅ |
| 🔐 Role-based login (Admin/QA/Dev) | ✅ |
| 💬 Slack notifications | ✅ |
| 📱 WhatsApp via Twilio (proxy) | ✅ |
| ⏰ Scheduled reminders | ✅ |
| 📧 Beautiful HTML emails | ✅ |

---

## Quick Start

1. Unzip and open `index.html`
2. Login: `admin` / `admin123`
3. Go to Admin Panel → Configure EmailJS
4. Start checking items!

---

## Login Credentials

| Role | Username | Password | Access |
|---|---|---|---|
| Admin | admin | admin123 | Everything |
| QA Engineer | qa | qa123 | Checklists + History |
| Developer | dev | dev123 | Checklists only |

To change passwords, edit `js/auth.js` → `USERS` object.

---

## Deploy to GitHub Pages

```bash
git init
git add .
git commit -m "WP QA Pro v2"
git remote add origin https://github.com/YOUR_USERNAME/wp-deploy-checklist.git
git push -u origin main
```

Then: Settings → Pages → main → Save

---

## EmailJS Setup

Same as v1 — see previous README. Use same Service ID, Public Key, and Template IDs.

---

## Slack Notifications Setup

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Create New App → From Scratch
3. Add feature: **Incoming Webhooks** → Activate
4. Click **Add New Webhook to Workspace**
5. Choose channel → Allow
6. Copy the Webhook URL
7. In app: Admin Panel → Notifications → Paste webhook URL → Enable → Save

Works directly from browser — no backend needed! ✅

---

## WhatsApp (Twilio) Setup

WhatsApp requires a server-side proxy due to CORS restrictions.

### Option A — n8n (Free, Self-hosted)
1. Install n8n: `npx n8n`
2. Create workflow: Webhook → Twilio node
3. Copy webhook URL
4. In browser console: `localStorage.setItem('wpqa-wa-webhook', 'YOUR_N8N_URL')`

### Option B — Zapier
1. Create Zap: Webhooks by Zapier → Twilio
2. Copy webhook URL → set in localStorage

### Twilio Setup
1. Sign up at [twilio.com](https://twilio.com)
2. Activate WhatsApp Sandbox
3. Get Account SID, Auth Token, From Number
4. Enter in Admin Panel → Notifications

---

## PDF Report

Click **⬇ PDF** in the topbar anytime. Includes:
- Project details table
- Completion status badge
- Full checklist with ✓/✗ marks
- Digital signature (if signed)
- Page numbers

---

## Auto-save

Progress saves automatically every 30 seconds. You'll see a green "Auto-saving" indicator in the topbar. Data is stored in browser localStorage.

---

## Scheduled Reminders

1. Admin Panel → Notifications → Scheduled Reminders
2. Set hours (e.g. 24)
3. Enter reminder email
4. Enable toggle → Save

The app checks every minute and shows a reminder toast if checklist is incomplete after the set time.

---

## Project Structure

```
wp-qa-v2/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── data.js          ← Checklist items
│   ├── auth.js          ← Login & roles
│   ├── app.js           ← Core logic + autosave + confetti
│   ├── dashboard.js     ← Charts & stats
│   ├── email.js         ← EmailJS sending
│   ├── pdf.js           ← PDF generation
│   ├── signature.js     ← Digital signature pad
│   └── notifications.js ← Slack + WhatsApp
└── README.md
```

---

## License

MIT — Free to use and modify.
