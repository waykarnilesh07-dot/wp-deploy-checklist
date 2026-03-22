# WP Deploy QA — Checklist System

A clean, dark-themed WordPress deployment checklist tool with **real email sending** via EmailJS.
Built for agencies and freelancers to manage pre/post go-live QA workflows.

**Live Demo** → Deploy to GitHub Pages (instructions below)

---

## Features

- ✅ Before Go-Live & After Go-Live checklists (23 sections, 80+ items)
- 📧 Real email sending — Internal only OR Client + Team
- 📊 Live progress bar per phase
- 💾 Auto-saves progress in browser (localStorage)
- ➕ Add custom checklist items via Admin Panel
- 📁 Submission history log
- 📤 Export reports as CSV or text
- 📱 Fully responsive (mobile/tablet/desktop)
- 🔔 Falls back to `mailto:` if EmailJS is not configured

---

## Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/wp-deploy-checklist.git
cd wp-deploy-checklist
```

### 2. Open locally

Just open `index.html` in your browser — no build step needed.

```bash
# macOS
open index.html

# Or use VS Code Live Server extension
```

---

## Deploy to GitHub Pages (Free Hosting)

1. Push to GitHub
2. Go to **Settings → Pages**
3. Set source: **Deploy from a branch → main → / (root)**
4. Your URL will be: `https://YOUR_USERNAME.github.io/wp-deploy-checklist/`

---

## Setting Up Real Email (EmailJS)

EmailJS lets you send emails directly from the browser — **no backend needed**.
Free tier: **200 emails/month**.

### Step 1 — Create an EmailJS account

Go to [https://www.emailjs.com](https://www.emailjs.com) and sign up (free).

---

### Step 2 — Add an Email Service

1. In EmailJS dashboard → **Email Services → Add New Service**
2. Choose your email provider (Gmail, Outlook, etc.)
3. Authorise and connect your account
4. Note down your **Service ID** (e.g. `service_abc123`)

---

### Step 3 — Create Email Templates

You need **two templates** — one for Internal, one for External.

Go to **Email Templates → Create New Template**

#### Internal Template

- **To Email:** `{{to_email}}`
- **Subject:** `[WP QA — Internal] {{project_name}} | {{phase}} | {{completion_pct}}`
- **Body:**

```
Hi Team,

Here is the internal QA report for {{project_name}}.

Project  : {{project_name}}
Website  : {{website_url}}
Phase    : {{phase}}
Date     : {{date}}
Reviewed : {{checked_by}}
Status   : {{status}} ({{completion_pct}})

────────────────────────────────────
FULL CHECKLIST REPORT:
────────────────────────────────────
{{report_body}}

Remarks: {{remarks}}

This is an internal report only.
```

Note the **Template ID** (e.g. `template_internal123`)

---

#### External Template (Client-facing)

- **To Email:** `{{to_email}}`
- **CC:** `{{cc_email}}`
- **Reply To:** `{{reply_to}}`
- **Subject:** `[WP Delivery] {{project_name}} — Go-Live QA Report ({{completion_pct}} Complete)`
- **Body:**

```
Dear {{client_name}},

Please find below the QA report for your website.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROJECT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Project  : {{project_name}}
Website  : {{website_url}}
Phase    : {{phase}}
Date     : {{date}}
Reviewed : {{checked_by}}
Team     : {{team_name}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPLETION STATUS : {{status}}
Items Completed   : {{checked_count}} / {{total_count}} ({{completion_pct}})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHECKLIST SUMMARY:

{{report_body}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REMARKS: {{remarks}}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If you have any questions, please reply to this email.

Regards,
{{team_name}}
```

Note the **Template ID** (e.g. `template_external456`)

---

### Step 4 — Get your Public Key

In EmailJS dashboard → **Account → General** → copy your **Public Key**

---

### Step 5 — Enter credentials in the app

1. Open the app → click **Admin Panel** in the sidebar
2. Scroll to **EmailJS Configuration**
3. Enter:
   - Service ID
   - Public Key
   - Internal Template ID
   - External Template ID
4. Click **Save Email Config**

Done! Emails will now send for real.

---

## Template Variables Reference

| Variable | Description |
|---|---|
| `{{project_name}}` | Project Name field |
| `{{website_url}}` | Website URL field |
| `{{client_name}}` | Client Name field |
| `{{team_name}}` | Internal Team field |
| `{{checked_by}}` | Checked By field |
| `{{date}}` | Date field |
| `{{phase}}` | BEFORE GO-LIVE or AFTER GO-LIVE |
| `{{completion_pct}}` | e.g. 87% |
| `{{checked_count}}` | Number of checked items |
| `{{total_count}}` | Total items |
| `{{status}}` | COMPLETE ✓ or PENDING |
| `{{remarks}}` | Notes/remarks field |
| `{{report_body}}` | Full checklist report text |
| `{{to_email}}` | Primary recipient email |
| `{{cc_email}}` | CC email (external mode) |
| `{{reply_to}}` | Reply-to email |
| `{{submission_type}}` | Internal or Client + Team |

---

## Fallback (No EmailJS)

If EmailJS is not configured, clicking **Send** opens your system email client
(`mailto:`) pre-filled with the full report. This works without any setup.

---

## Project Structure

```
wp-deploy-checklist/
├── index.html          ← Main app
├── css/
│   └── style.css       ← All styles
├── js/
│   ├── data.js         ← Checklist items (edit to customise)
│   ├── app.js          ← Core app logic
│   └── email.js        ← EmailJS integration
└── README.md
```

---

## Customising Checklist Items

Edit `js/data.js` to add, remove, or rename default checklist items.
You can also add items at runtime via **Admin Panel → Manage Checklist Items**.

---

## License

MIT — free to use, modify, and deploy.
