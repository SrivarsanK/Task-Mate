# TaskMate - Stay Accountable. Achieve More.

A premium productivity and accountability web application built with Next.js, Supabase, and modern web technologies.

## 🚀 Features

- **Smart Task Management**: Create, organize, and track tasks with deadlines
- **Accountability Partners**: Invite partners via email to track your progress
- **Automated Reminders**: Beautiful email reminders before, on, and after deadlines
- **Real-time Dashboard**: Modern sidebar navigation with comprehensive stats
- **Email Verification**: Secure user registration with email verification
- **Google OAuth**: Sign in with Google for seamless authentication
- **Progress Tracking**: Visual completion rates and productivity insights
- **Activity Feed**: Real-time updates of your task activities

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Email**: Resend API for transactional emails
- **Authentication**: Supabase Auth with Google OAuth
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- Resend account for email functionality
- Google Cloud Console project (for OAuth)

## 🚀 Getting Started

### 1. Clone the repository

\`\`\`bash
git clone https://github.com/yourusername/taskmate.git
cd taskmate
\`\`\`

### 2. Install dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Environment Setup

Create a `.env.local` file in the root directory:

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Resend
RESEND_API_KEY=your_resend_api_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### 4. Database Setup

Run the SQL scripts in your Supabase SQL editor:

1. Execute `scripts/001-create-tables.sql`
2. Execute `scripts/002-add-email-verification.sql`

### 5. Configure Authentication

#### Google OAuth Setup:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized origins: `http://localhost:3000` and your production URL
4. Add redirect URI: `https://your-project.supabase.co/auth/v1/callback`
5. Enable Google provider in Supabase Dashboard

### 6. Run the development server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

\`\`\`
taskmate/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                  # Utility functions
├── scripts/              # Database scripts
└── public/               # Static assets
\`\`\`

## 🔧 Key Components

- **Dashboard Layout**: Modern sidebar with navigation
- **Task Management**: CRUD operations with real-time updates
- **Email System**: Verification and reminder emails
- **Authentication**: Google OAuth + email/password
- **Progress Tracking**: Stats and analytics dashboard

## 📧 Email Templates

The app includes beautiful, responsive email templates for:
- Email verification
- Task reminders (24h before, deadline, 24h after)
- Partner notifications

## 🔒 Security Features

- Row Level Security (RLS) in Supabase
- Email verification for OAuth users
- Secure token-based verification
- Rate limiting for email requests

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to update these for production:
- `NEXT_PUBLIC_APP_URL`: Your production URL
- Update Google OAuth redirect URIs
- Update Supabase authorized domains

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Supabase](https://supabase.com/) for the backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Resend](https://resend.com/) for email delivery

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Contact us at support@taskmate.app

---

Made with ♥ by the TaskMate team
