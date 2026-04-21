# HARITECH EXCLUSIVE SERVICES — Website Deployment Guide

## 📁 Files in This Package

| File | Purpose |
|------|---------|
| `index.html` | Main public website |
| `admin-dashboard.html` | Admin control panel |
| `admin-login.html` | Admin login page |
| `README.md` | This guide |

---

## 🚀 Quick Start (Local)

1. Put all 3 files in the **same folder**
2. Open `index.html` in your browser — this is your live website
3. Open `admin-login.html` to access the admin panel

**Default admin credentials:**
- Username: `admin`
- Password: `admin123`

> ⚠️ Change your password immediately after first login: **Dashboard → Settings → Admin Password**

---

## 🌐 Deployment Options

### Option 1: GitHub Pages (Free)
1. Create a free account at [github.com](https://github.com)
2. Create a new repository (e.g. `haritech-website`)
3. Upload all 3 files to the repository
4. Go to **Settings → Pages → Source → Deploy from branch → main**
5. Your site will be live at: `https://yourusername.github.io/haritech-website`

### Option 2: Netlify (Free, Recommended)
1. Go to [netlify.com](https://netlify.com) and sign up free
2. Drag and drop your folder onto the Netlify dashboard
3. Your site is instantly live with a free `.netlify.app` URL
4. Connect a custom domain in **Site Settings → Domain Management**

### Option 3: Hostinger / cPanel Hosting
1. Log into your hosting control panel
2. Open **File Manager → public_html**
3. Upload all 3 files
4. Your site is live at your domain (e.g. `haritechexclusive.com`)

### Option 4: Any Static Host
These are plain HTML files — they work on **any** web host, CDN, or file server.
No server-side code, no database, no Node.js required.

---

## ⚙️ How It Works

All data is stored in the browser's **localStorage**. When you save anything in the admin dashboard, the website detects the change within 1 second and updates automatically.

```
Admin saves product → localStorage updated → Website polls every 600ms → loadAll() runs → Product appears
```

### Important: Sync Requirements
- The admin and website must be open in the **same browser** on the **same device**
- OR opened from the same origin (same domain/file path)
- The sync works across browser tabs on the same device

### Data Persistence
- All content is saved locally in the browser
- Use **Dashboard → Settings → Export All Data** to create a JSON backup
- Use **Import Data** to restore from backup
- **If you clear browser data, all content will be lost** — backup regularly

---

## 🔧 Admin Dashboard Features

| Section | What You Can Do |
|---------|----------------|
| **Dashboard** | Overview stats, analytics charts, pending alerts |
| **Services** | Add/edit/delete services with images and icons |
| **Products** | Manage product catalog with photos, prices, status |
| **Blog Posts** | Write and publish articles with cover images |
| **Testimonials** | Add customer reviews with star ratings and photos |
| **Bookings** | View and manage appointment requests |
| **Orders** | Track product orders and payment status |
| **Messages** | Read contact form submissions |
| **Subscribers** | View newsletter signups, export to CSV |
| **Hero Section** | Edit homepage headline, buttons, background |
| **Contact Info** | Update phone, email, WhatsApp, location |
| **Social Media** | Set Facebook, Instagram, Twitter, etc. links |
| **Appearance** | Upload logo, change colors, update site name |
| **Payment Methods** | Configure Paystack, Flutterwave, bank transfer, WhatsApp orders |
| **Promo Banner** | Show/hide announcement bar at top of site |
| **FAQ Manager** | Add/edit/reorder FAQ questions |
| **Settings** | Change admin username and password, manage storage |

---

## 💳 Payment Setup

### Paystack (Recommended for Nigeria)
1. Sign up at [paystack.com](https://paystack.com)
2. Go to **Settings → API Keys**
3. Copy your **Public Key** (starts with `pk_live_...`)
4. In Admin → **Payment Methods → Paystack** → paste your Public Key
5. Enable Paystack and save

### Flutterwave
1. Sign up at [flutterwave.com](https://flutterwave.com)
2. Go to **Settings → API Keys**
3. Copy your **Public Key**
4. In Admin → **Payment Methods → Flutterwave** → paste and enable

### Bank Transfer
1. Go to Admin → **Payment Methods → Bank Transfer**
2. Enter your bank name, account name, and account number
3. Enable and save — customers will see your bank details at checkout

### WhatsApp Orders
1. Go to Admin → **Payment Methods → WhatsApp Order**
2. Enter your WhatsApp number (format: `234XXXXXXXXXX`)
3. Customise the auto-message template
4. Enable and save

---

## 🖼️ Image Guidelines

| Type | Recommended Size | Max Upload |
|------|-----------------|------------|
| Product photos | 800×600px | 10MB (auto-compressed) |
| Service images | 800×800px | 10MB (auto-compressed) |
| Blog cover | 1200×600px | 10MB (auto-compressed) |
| Logo | 400×400px (square) | 5MB |
| Testimonial photos | 200×200px (square) | 5MB |

> Images are **automatically compressed** when uploaded. A 3MB photo becomes ~100-150KB in storage.

### Storage Limit
Browser localStorage allows ~5MB total. Monitor usage in **Admin → Settings** (storage bar shown).
- If storage is >80% full, delete unused images or use smaller photos
- Export a backup before clearing storage

---

## 🔒 Security Notes

- The admin login uses **localStorage** to store credentials (not a server)
- For a production deployment, consider adding server-side authentication
- Always change the default password (`admin123`) before going live
- The admin URL is publicly accessible — keep your password secure

---

## 📱 Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome 80+ | ✅ Full support |
| Firefox 75+ | ✅ Full support |
| Safari 14+ | ✅ Full support |
| Edge 80+ | ✅ Full support |
| Mobile Chrome | ✅ Full support |
| Mobile Safari | ✅ Full support |

---

## 🛠️ Customisation

### Change Brand Colors
1. Admin → **Appearance → Theme Colors**
2. Pick Primary color (main brand color)
3. Pick Accent color (buttons, highlights)
4. Click **Apply Theme**

### Update Contact Information
1. Admin → **Contact Info**
2. Update phone, email, WhatsApp number, location
3. Save — updates appear on website instantly

### Add Your First Products
1. Admin → **Products → Add Product**
2. Upload a product photo, fill in name, price, category
3. Set status to "In Stock"
4. Save — appears on website immediately

---

## 📞 Tech Stack

- **Frontend**: Pure HTML5, CSS3, Vanilla JavaScript
- **Fonts**: Syne + DM Sans (Google Fonts)
- **Icons**: Font Awesome 6
- **Charts**: Chart.js 4
- **Payments**: Paystack, Flutterwave (loaded on demand)
- **Storage**: Browser localStorage
- **Hosting**: Any static file host

---

*HARITECH EXCLUSIVE SERVICES — Smart tech, smart living*
