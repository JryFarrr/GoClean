# Quick Deploy Checklist

## Before Deploy:

1. **Setup PostgreSQL Database**
   ```bash
   # Get free PostgreSQL from:
   # - Neon: https://neon.tech (Recommended)
   # - Supabase: https://supabase.com
   # - Railway: https://railway.app
   ```

2. **Update .env file**
   ```bash
   cp .env.example .env
   # Edit .env and add your DATABASE_URL
   ```

3. **Run Migration Script**
   ```powershell
   .\migrate-to-postgres.ps1
   ```

   Or manually:
   ```bash
   # Update prisma/schema.prisma: provider = "postgresql"
   npm run db:generate
   npx prisma migrate dev --name init
   npm run db:seed
   ```

4. **Test Build**
   ```bash
   npm run build
   npm start
   ```

5. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

## Vercel Deploy:

1. Go to https://vercel.com
2. Import your GitHub repository
3. Add Environment Variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL`: `https://your-app.vercel.app`

4. Deploy!

## After Deploy:

1. Update `NEXTAUTH_URL` in Vercel to your production URL
2. Redeploy
3. Test the app

---

📖 For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)
