# ⚡ Inflow — Intelligent Expense & GST Tax Tracker

Inflow is a modern full-stack web application designed for smart receipt scanning, expense categorization, GST tax reporting, return/warranty tracking, and budget management.
---

## 🌟 Key Features

1. **AI Multimodal Receipt Scanner**
   - Upload receipt images or PDFs to instantly parse merchant name, total amount, transaction date, GSTIN, GST amount, and individual line items using Gemini AI.

2. **Monthly Expense Budgeting & Daily Safe Limits**
   - Set monthly budget limits, track spent balance for the current month, and compute dynamic daily safe spending allowances.

3. **Tax & GST Deduction Hub**
   - Automatic GST breakdown (CGST/SGST/IGST), tax category classification, and one-click JSON/CSV tax export reports.

4. **Return Window & Warranty Expiry Sentinel**
   - Active tracking for return deadlines (7/15/30 days) and product warranty periods with status badges (`Active`, `Expiring Soon`, `Expired`).

5. **Cloud Synchronization with Supabase**
   - Offline-first local storage paired with secure cloud backup to Supabase PostgreSQL with Row Level Security (RLS).

---

## 🚀 Quick Start Guide (Local Setup)

### Prerequisites
- **Node.js**: v18 or higher installed on your machine
- **npm**: v9 or higher

### Step 1: Install Dependencies
```bash
npm install
Step 2: Configure Environment Variables
Create a .env file in the project root:
code
Env
GEMINI_API_KEY="your_google_gemini_api_key"
VITE_SUPABASE_URL="https://your_project.supabase.co"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"
Step 3: Start the Local Development Server
code
Bash
npm run dev
Open your browser at http://localhost:3000.
📦 Production Build Instructions
To build the full-stack application into a single executable production server:
code
Bash
# 1. Build client static assets & esbuild CJS server
npm run build

# 2. Start compiled production Node server
npm start
🗄️ Supabase SQL Database Schema
Run this SQL snippet in your Supabase SQL Editor:
code
SQL
-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view and edit their own profile" ON public.profiles;
CREATE POLICY "Users can view and edit their own profile"
  ON public.profiles FOR ALL USING (auth.uid() = id);

-- 2. Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant_name TEXT NOT NULL,
  transaction_date DATE NOT NULL,
  total_amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',
  category TEXT NOT NULL,
  gst_amount NUMERIC,
  gstin TEXT,
  is_tax_deductible BOOLEAN DEFAULT false,
  tax_category TEXT,
  payment_method TEXT,
  return_window_days INT DEFAULT 0,
  return_status TEXT,
  return_deadline DATE,
  warranty_months INT DEFAULT 0,
  warranty_status TEXT,
  warranty_expiry DATE,
  serial_number TEXT,
  model_number TEXT,
  notes TEXT,
  items JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own expenses" ON public.expenses;
CREATE POLICY "Users can manage their own expenses"
  ON public.expenses FOR ALL USING (auth.uid() = user_id);

-- 3. Auto Profile Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
🛠️ Tech Stack
Frontend: React 18, TypeScript, Tailwind CSS, Lucide Icons, Motion Animation
Backend: Node.js, Express.js, Vite Middleware
AI Engine: Google Gemini API (@google/genai)
Database & Auth: Supabase (PostgreSQL & Row Level Security)
