# AgroWorld — Landing Page + Web App

Stack: **Next.js 15** · **Tailwind CSS** · **Framer Motion** · **NextAuth** · **Vercel**

## Démarrage local

```bash
cd agroworld-web
npm install
cp .env.example .env.local
# Éditer .env.local avec tes valeurs
npm run dev
# → http://localhost:3000
```

## Structure

```
src/
├── app/
│   ├── page.tsx              # Landing publique (/)
│   ├── login/page.tsx        # Login (/login)
│   ├── app/page.tsx          # App protégée (/app)
│   ├── api/auth/             # NextAuth
│   └── api/contact/          # Formulaire partenaires
├── components/landing/       # Sections landing
└── middleware.ts             # Protection /app/*
```

## Déploiement Vercel

1. Push sur GitHub
2. Importer le projet sur vercel.com
3. Root directory : `agroworld-web`
4. Ajouter les variables d'environnement
5. Deploy → auto à chaque push sur `main`

## Variables d'environnement Vercel

| Variable | Valeur |
|----------|--------|
| NEXTAUTH_URL | https://ton-projet.vercel.app |
| NEXTAUTH_SECRET | `openssl rand -base64 32` |
| ADMIN_EMAIL | ton@email.com |
| ADMIN_PASSWORD | mot de passe fort |
