
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/a87bcb47-a23c-4c2e-93f2-970fd3984d25

## Local Development Setup

### Prerequisites
1. Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
2. [Supabase CLI](https://supabase.com/docs/guides/cli) - for local development with Supabase
3. [Docker](https://docs.docker.com/get-docker/) - required for local Supabase development

### Step 1: Clone and Run the Frontend

```sh
# Clone the repository using the project's Git URL
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Install the necessary dependencies
npm i

# Start the development server with auto-reloading and instant preview
npm run dev
```

### Step 2: Set Up Local Supabase Instance

1. Install Supabase CLI:
```bash
# macOS
brew install supabase/tap/supabase

# Windows (requires scoop.sh)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

2. Start local Supabase:
```bash
# Initialize Supabase
supabase init

# Start the local Supabase instance
supabase start

# This will output your local connection details
```

3. Copy the connection details provided by `supabase start` and create a `.env.local` file in your project root:
```
VITE_SUPABASE_URL=your_local_supabase_url
VITE_SUPABASE_ANON_KEY=your_local_anon_key
```

### Backend Features Available Locally

#### Authentication
- Local auth is ready to use with the started Supabase instance
- Default test user: test@example.com / password123
- Manage users via Supabase Studio at http://localhost:54323

#### Database
- Access Studio at http://localhost:54323
- Create tables and manage data through the UI
- Run migrations:
```bash
supabase db reset    # Reset to clean state
supabase db pull     # Generate migration files
supabase db push     # Apply migrations
```

#### File Storage
- Available through Supabase Storage
- Manage via Studio or API
- Local files stored in `supabase/storage`

#### APIs & Edge Functions
- Create Edge Functions:
```bash
supabase functions new my-function
supabase functions serve   # Run locally
```

## Project Structure
```
├── src/
│   ├── components/    # React components
│   ├── pages/         # Route components
│   ├── hooks/         # Custom React hooks
│   └── lib/           # Utility functions
├── supabase/          # Supabase configuration
└── ...
```

## What technologies are used?

This project is built with:
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (for backend functionality)

## Deployment Options

1. **Using Lovable**
   - Open [Lovable](https://lovable.dev/projects/a87bcb47-a23c-4c2e-93f2-970fd3984d25)
   - Click on Share -> Publish

2. **Custom Deployment**
   - Deploy frontend to any static hosting (Netlify, Vercel, etc.)
   - Deploy Supabase to either:
     - Supabase Cloud (recommended for production)
     - Self-hosted using Docker

## Custom Domain Setup

We don't support custom domains directly through Lovable (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)

