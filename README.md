**[English](README.md) | [Русский](README.ru.md)**

# My Scratch List

### [myscratchlist.vercel.app](https://myscratchlist.vercel.app)

**Next-gen scratch posters.** Create top lists of anything, generate covers with AI, scratch off items like lottery tickets and share your progress with friends.

![Main Page](screenshots/005402.png)

---

## What is this?

Remember scratch cards? The ones where you scratch off the silver layer with a coin. We took that mechanic and turned it into a web app.

An admin creates a top list (movies, games, books, albums, restaurants — whatever), and users "scratch off" items they've already tried/watched/played. Progress is saved, achievements unlock, friends get jealous.

---

## Features

### Unlimited Top Lists

Create as many lists as you want on any topic. TOP-100 board games, TOP-50 movies of 2025, TOP-30 restaurants in your city — any collection. Each list appears in the sidebar as a separate page. Choose which list to show on the main page.

### AI Cover Generation

Generate a unique cover for each item and each list via **Together AI**. Write a prompt or just hit the button — the AI draws.

- **Single generation** — generate an image for one item right from the list
- **Batch generation** — "Generate all" button processes the entire list in batches of 3
- **Preview before saving** — don't like the result? Regenerate as many times as you want
- **Model selection** — from fast FLUX.1 Schnell to premium models, list loaded from Together AI

![List Editor](screenshots/005505.png)

### Generation Styles

16 style chips you can combine however you want:

🎨 Painting · 📷 Realism · 🎬 Cinematic · 🖼 Art · 🌈 Vibrant · 🌑 Dark · ◻️ Minimal · 💧 Watercolor · 🧊 3D · 🏮 Anime · 📼 Retro · ✨ Fantasy · 🖤 Noir · 👾 Pixel · 🖌 Oil · 💜 Neon

Selected styles apply to all generations. Want the whole list in "cinematic + dark" style? Two clicks.

![Admin Settings](screenshots/005432.png)

### Scratch Mechanic

Hover over a card — an image hides under the purple coating. Scratch with your finger or mouse — just like a real scratch card. When enough is scratched off — the item counts and saves to your profile.

### 20 Achievements

Achievement system with progress and hover descriptions:

⭐ First Step · 🖐 High Five · 🔟 Top Ten · 🎲 Twenty · 🏅 Quarter Way · 🎪 Thirty · 🌟 Halfway · 🔥 Sixty · 💫 Three Quarters · 🚀 Ninety · 🏆 Full Clear · 👑 Number One · 🥇 Top 3 Leader · 🎖 First Five · 🎯 Top-10 Hunter · 💎 Top-20 Master · 🔮 From the Depths · ⚡ Serial Scratcher · 🧭 Explorer · ✨ Perfectionist

Unlocked ones glow purple. Locked ones are grey. Dedicated page with all achievements and detailed descriptions.

![Achievements](screenshots/005337.png)

### Seed Phrase Authentication

No passwords, no email. On registration, a unique 12-word phrase is generated (BIP39 standard). Write it down — sign in from anywhere. Lose it — tough luck. Simple and secure.

Nicknames are auto-generated (SwiftWolf42, BraveDragon777...) and guaranteed unique.

### Personal Profile & Sharing

Every user has their own page with progress. Copy the link and send it to friends — they'll see which items you've scratched and which achievements you've unlocked. Switch between lists on the profile page if there are multiple.

### Admin Panel

Everything in one place:

- Create and delete lists
- Inline editing of each item (title, rank, rating, description, image)
- Import and export items as JSON
- Cover generation — single, batch, with preview
- AI model and style selection
- Choose which list to display on the main page

![Items Management](screenshots/005537.png)

### Multilingual

Russian and English interface. Switch with one button in the sidebar. All texts, achievements, generation styles — everything is translated.

### Design

Dark theme with grainy gradient background and liquid glass effects. Purple accents, noise texture, backdrop-blur on navigation and sidebar. Responsive layout — works on desktop and mobile.

---

## Quick Start

```bash
git clone <repo-url>
cd Boardgamer-Fan-Site
npm install
cp .env.example .env.local
# Fill .env.local with your data
npm run dev
```

Open `http://localhost:3000` and go.

---

## ENV Variables

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `MONGODB_DB` | Database name |
| `SECRET` | NextAuth JWT secret |
| `TOGETHER_API_KEY` | [Together AI](https://together.ai) API key |

---

## Deploy

Ready to deploy on **Vercel**. Add ENV variables in project settings and deploy.

---

*by [WinterWeb](https://winterweb.ru)*
