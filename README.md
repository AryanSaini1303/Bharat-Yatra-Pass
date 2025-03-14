# **BharatYatraPass** 🎫🚆

BharatYatraPass is a seamless online ticket booking platform for India's iconic monuments and tourist attractions. With a mobile-first design and intuitive interface, it simplifies ticket reservations, verification, and entry management.

## 🚀 **Key Features**

### **🔹 User Portal**

* 📱 **Mobile-First UI** – Smooth experience across devices.
* 🏛️ **Monument Discovery** – Browse & filter attractions.
* 🔐 **Google & Email Authentication** – Secure login system.
* 🎫 **Fast Ticket Booking** – Select a date & book instantly.
* 💳 **Secure Payment Gateway** – Integrated with Razorpay.
* 📂 **User Dashboard** – Manage & track bookings.
* 📄 **Digital Ticket with QR & ID** – Instant e-ticket generation.

### **🛠️ Admin Panel**

* 🏗️ **Monument & Pricing Management** – Add, edit, or remove places.
* 📊 **Booking & Payment Insights** – View transactions & revenue.
* 📈 **Reports & Analytics** – Monitor user activity & trends.
* 👥 **User & Support Management** – Resolve issues efficiently.

### **🎫 Gate Authority System**

* 📷 **QR Code Scanning** – Verify tickets instantly.
* 🔢 **Manual Ticket ID Entry** – In case of scanning issues.
* 📡 **Real-time Ticket Status** – Check validity before allowing entry.
* 📝 **History of Scanned Tickets** – Maintain a log for security.

### **🕒 Automated Ticket Expiry Management**

* 🕵️ **Background Job Execution** – A scheduled Supabase job runs every minute to check for expired tickets.
* ⏳ **Automated Expiry Updates** – If a ticket’s date-time is past, its status is automatically set to **"expired."**

## 🛠 **Tech Stack**

* **Frontend:** Next.js, React
* **Backend:** Next.js
* **Database:** Supabase
* **Authentication:** Supabase
* **Payment Processing:** Razorpay
* **QR Code Generation & Scanning:** QR Code API
* **Deployment:** Vercel

## 🔧 **Installation & Setup**

### **Clone the Repository**

```bash
git clone https://github.com/yourusername/BharatYatraPass.git
cd BharatYatraPass
```

### **Install Dependencies**

```bash
npm install
```

### **Environment Variables**

Create a `.env` file and configure the required variables:

```env
GOOGLE_ID=your_google_id
GOOGLE_SECRET=your_google_secret
NEXTAUTH_SECRET=your_nextauth_secret

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_public_razorpay_key_id
```

### **Run the Development Server**

```bash
npm run dev
```

## 🚀 **Future Enhancements**

* **📍 AI-Powered Travel Guide** – Smart recommendations for users.
* **📲 Mobile App** – Dedicated iOS & Android apps.
* **📡 AR-Based Monument Navigation** – Enhance user experience.

---

**Developed with ❤️ by Aryan & Team.**
