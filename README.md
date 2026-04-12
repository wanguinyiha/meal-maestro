# Meal Maestro

A modern, full-stack meal planning and recipe management application built with Next.js, Supabase, and NextAuth.

## Features

- **User Authentication**: Secure login/signup with email/password via Supabase and NextAuth
- **Recipe Management**: Create, edit, view, and delete recipes with ingredients, instructions, and nutritional info
- **Meal Planning**: Plan weekly meals with drag-and-drop interface
- **Grocery Lists**: Generate shopping lists based on planned meals
- **User Profiles**: Track achievements, favorites, and dietary preferences
- **Responsive Design**: Mobile-first UI with Tailwind CSS and Radix UI components
- **Password Reset**: Forgot password functionality with Supabase email recovery

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Authentication**: NextAuth.js with Supabase adapter
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel (with analytics)
- **State Management**: React hooks, NextAuth session
- **Forms**: React Hook Form with Zod validation (planned)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd meal-maestro
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret

   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

   GITHUB_CLIENT_ID=your-github-client-id (if using GitHub auth)
   GITHUB_CLIENT_SECRET=your-github-client-secret
   ```

4. Set up Supabase database:
   - Create tables based on the schema in `types/TableTypes.ts`
   - Enable Row Level Security (RLS) policies for user data protection
   - Configure email templates for password reset

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The app uses the following main tables:
- `recipes`: Recipe details
- `recipe_ingredients`: Ingredients for recipes
- `recipe_instructions`: Step-by-step instructions
- `planned_meals`: User's meal plans
- `user_favorites`: Favorite recipes
- `meal_plans`: Meal plan metadata

See `types/TableTypes.ts` for full schema definitions.

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

## Project Structure

```
app/
├── api/                 # API routes
├── auth/                # Auth pages (login, signup, etc.)
├── recipes/             # Recipe-related pages
├── planner/             # Meal planning page
├── profile/             # User profile page
├── settings/            # User settings page
└── layout.tsx           # Root layout

components/
├── ui/                  # Reusable UI components
└── ...                  # App-specific components

lib/                     # Utility functions
types/                   # TypeScript type definitions
utils/supabase/          # Supabase client setup
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXTAUTH_URL` | Base URL for NextAuth | Yes |
| `NEXTAUTH_SECRET` | Secret for NextAuth JWT | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | No |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret | No |

## Deployment

The app is configured for deployment on Vercel:

1. Connect your GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

## License

This project is licensed under the MIT License.

## Next Steps / TODO

- [ ] Add form validation with Zod
- [ ] Implement search and filtering for recipes
- [ ] Add recipe image uploads
- [ ] Create grocery list generation from meal plans
- [ ] Add unit tests with Jest/React Testing Library
- [ ] Set up CI/CD with GitHub Actions
- [ ] Add accessibility improvements
- [ ] Implement dark mode toggle
- [ ] Add recipe sharing features
- [ ] Integrate with nutrition APIs for auto-calculation