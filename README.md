🚀 LeadFlow NG

A lightweight lead-management and follow-up platform for Nigerian businesses.

LeadFlow NG** helps Nigerian businesses capture, organize, track, and follow up with leads from one centralized platform.

It is being built with a focus on **simplicity, affordability, and practical business automation**—giving small and growing businesses the tools they need to turn more enquiries into customers without the complexity of traditional CRM systems.

---

🎯 The Problem

Many small and growing businesses manage their leads through a combination of:

* WhatsApp conversations
* Phone calls
* Spreadsheets
* Notebooks
* Social media messages
* Personal reminders

As the number of enquiries increases, it becomes easy to lose track of potential customers.

Leads can be forgotten, follow-ups can be missed, and business owners may have little visibility into where their opportunities are coming from.

LeadFlow NG is built to solve that.

---

💡 The Solution

LeadFlow NG provides a centralized workspace where businesses can:

**Capture → Organize → Follow Up → Convert → Grow**

Instead of relying on scattered tools, businesses can manage their leads through one simple system.

---

# ✨ Current Features

### Lead Management

* Create new leads
* Store lead information
* View leads in a centralized table
* Track lead records
* Structured lead data
* Database-backed persistence

### Dashboard

* Centralized business workspace
* Lead overview
* Navigation between management modules
* Responsive interface

### Authentication

* User authentication foundation
* Protected application areas
* Database-backed sessions
* Secure application architecture

---

# 🛠️ Technology Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui

### Backend & Data

* Next.js
* Prisma ORM
* PostgreSQL
* Better Auth

### Development Tools

* Git
* GitHub
* npm
* Prisma CLI
* Prisma Studio
* VS Code

---

# 🏗️ System Architecture

```text
                         ┌───────────────────┐
                         │       User        │
                         └─────────┬─────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │     Next.js       │
                         │ React + Tailwind  │
                         └─────────┬─────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │ Application Logic │
                         │    & Routes       │
                         └─────────┬─────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │      Prisma       │
                         │       ORM         │
                         └─────────┬─────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │    PostgreSQL     │
                         │     Database      │
                         └───────────────────┘
```

---

# 📊 Lead Management Workflow

The current lead workflow is:

```text
┌─────────────────┐
│   Create Lead   │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Validate Data   │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Save to Database│
└────────┬────────┘
         ↓
┌─────────────────┐
│   Leads Table   │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Manage & Follow │
└─────────────────┘
```

---

# 🔐 Security & Authentication

LeadFlow NG is being developed with security and data protection in mind.

Current architecture includes:

* Better Auth
* Protected application routes
* Database-backed authentication
* Server-side validation
* Environment variables
* Type-safe database access

Sensitive configuration values are kept outside the source code using environment variables.

---

# 🗄️ Database

LeadFlow NG uses **PostgreSQL** with **Prisma ORM**.

Prisma provides:

* Type-safe database queries
* Schema management
* Database migrations
* Prisma Client
* Prisma Studio for database management

---

# 📁 Project Structure

The application follows a modular Next.js architecture designed to make the codebase easier to maintain and extend.

```text
LeadFlow-NG/
│
├── app/
│   ├── dashboard/
│   │   ├── leads/
│   │   └── ...
│   │
│   └── ...
│
├── components/
│   ├── dashboard/
│   ├── ui/
│   └── ...
│
├── lib/
│   ├── auth/
│   ├── generated/
│   └── ...
│
├── prisma/
│   ├── migrations/
│   └── schema.prisma
│
├── public/
│
├── .env
├── package.json
└── README.md
```

---

# 🚧 Development Roadmap

## Phase 1 — Foundation

* [x] Project initialization
* [x] Next.js application
* [x] Tailwind CSS
* [x] shadcn/ui
* [x] PostgreSQL
* [x] Prisma ORM
* [x] Database migrations
* [x] Prisma Studio
* [x] Better Auth
* [x] Dashboard
* [x] Leads module
* [x] Lead creation
* [x] Lead persistence
* [x] Leads table

## Phase 2 — Lead Management

* [ ] Edit leads
* [ ] Delete/archive leads
* [ ] Lead status
* [ ] Lead source
* [ ] Lead priority
* [ ] Lead assignment
* [ ] Lead notes
* [ ] Follow-up dates
* [ ] Activity history

## Phase 3 — CRM

* [ ] Customer management
* [ ] Contact management
* [ ] Opportunity management
* [ ] Sales pipeline
* [ ] Tasks
* [ ] Follow-up reminders
* [ ] Customer activity timeline

## Phase 4 — Business Intelligence

* [ ] Revenue dashboard
* [ ] Conversion analytics
* [ ] Lead source analytics
* [ ] Sales reports
* [ ] Performance metrics
* [ ] Exportable reports

## Phase 5 — Automation

* [ ] Email notifications
* [ ] Follow-up reminders
* [ ] WhatsApp integration
* [ ] Automated workflows
* [ ] Customer communication
* [ ] AI-assisted lead insights

---

# 🇳🇬 Built for Nigerian Businesses

LeadFlow NG is intentionally designed with the realities of Nigerian businesses in mind.

The goal isn't to build another complicated enterprise CRM.

The goal is to build something:

**Simple. Affordable. Practical. Local.**

A business should be able to start using LeadFlow NG without needing a dedicated IT department or spending hours learning complicated software.

---

# 🎯 Product Vision

The long-term vision is to make LeadFlow NG a lightweight business platform that helps organizations manage the complete customer journey:

```text
Lead
  ↓
Follow-up
  ↓
Opportunity
  ↓
Customer
  ↓
Sale
  ↓
Revenue
  ↓
Retention
```

The platform will progressively expand from simple lead management into a broader **customer and revenue management system**.

---

# 🚀 Getting Started

## Prerequisites

Make sure you have installed:

* Node.js
* npm
* PostgreSQL

## Installation

Clone the repository:

```bash
git clone YOUR_REPOSITORY_URL
```

Enter the project:

```bash
cd LeadFlow-NG
```

Install dependencies:

```bash
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Configure your database and authentication environment variables.

Run Prisma migrations:

```bash
npx prisma migrate dev
```

Generate Prisma Client:

```bash
npx prisma generate
```

Start the development server:

```bash
npm run dev
```

Open the application:

```text
http://localhost:3000
```

---

# 📸 Screenshots

Screenshots will be added as the product interface evolves.

Recommended showcase images:

* Dashboard
* Leads table
* Create lead page
* Lead details
* Authentication
* Analytics

---

# 🔮 Future Direction

LeadFlow NG is being developed incrementally.

The objective is to start with a focused lead-management experience and evolve into a broader platform for Nigerian businesses.

Potential future capabilities include:

* WhatsApp integration
* Email automation
* AI lead scoring
* Sales forecasting
* Mobile application
* Payment integration
* Advanced analytics
* Team collaboration
* Multi-business support
* API integrations

---

# 👨‍💻 Author

## Emmanuel Joshua

**Software Developer • Solution Architect • Digital Transformation Strategist**

I'm passionate about building practical technology solutions that solve real business problems.

🌐 **Portfolio:**
https://softontechsolution.github.io/

💻 **GitHub:**
https://github.com/softontechsolution

---

## ⭐ Project Status

**Active Development**

LeadFlow NG is currently under active development, with the core lead-management foundation already implemented.

---

<p align="center">
  <b>LeadFlow NG</b>
  <br/>
  Helping Nigerian businesses turn more leads into customers.
  <br/><br/>
  ⭐ Star the repository if you find the project interesting.
</p>
