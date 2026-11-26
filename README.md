<h1 align="center">🛍 nxt-shop</h1>

<p align="center">
A ready-to-use online store template for <b>Telegram Mini Apps (TWA)</b> built with <b>Next.js 16</b>, <b>Auth.js v5</b>, <b>Prisma</b>, <b>PostgreSQL</b>, and <b>Feature-Sliced Design (FSD)</b>.
</p>

<p align="center">
Built on top of <a href="https://github.com/nfluvv/nxt-v2"><b>nxt-v2</b></a>.
</p>

---

> [!NOTE]
> Customers don't register. They open the shop inside Telegram and are logged in automatically with native Telegram auth (`initData` cryptographic validation).

> [!IMPORTANT]
> Orders are sent to your manager in Telegram as soon as the customer confirms checkout. Payment is arranged by the manager. Online payments are on the roadmap (see below).

> [!TIP]
> The project uses **Feature-Sliced Design (FSD)**. Each layer has a clear job, so the code stays clean as the shop grows.

---

## ✨ Features

<table>
  <thead>
    <tr>
      <th width="280" align="left">Feature</th>
      <th align="left">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td width="280"><b>Home Page</b></td>
      <td>Banners, category rail, product rails (new, sale, popular) and an infinite "For you" feed.</td>
    </tr>
    <tr>
      <td width="280"><b>Catalog</b></td>
      <td>Search, categories, filters (size, color, price, in stock), sorting and cursor-based infinite scroll. All state lives in the URL.</td>
    </tr>
    <tr>
      <td width="280"><b>Product Page</b></td>
      <td>Swipeable gallery, color and size variants, live stock status and a sticky add-to-cart button.</td>
    </tr>
    <tr>
      <td width="280"><b>Saved Products</b></td>
      <td>One-tap bookmarks with optimistic updates and a dedicated page.</td>
    </tr>
    <tr>
      <td width="280"><b>Cart</b></td>
      <td>Server-side cart. Quantity controls, stock limits and a clear warning when an item changes or runs out.</td>
    </tr>
    <tr>
      <td width="280"><b>Checkout</b></td>
      <td>Contacts, delivery method, address and comment. Prices and totals are always calculated on the server.</td>
    </tr>
    <tr>
      <td width="280"><b>Safe Orders</b></td>
      <td>Stock check, stock reservation and order creation run in one transaction. No overselling, no duplicate orders on double tap.</td>
    </tr>
    <tr>
      <td width="280"><b>Manager Notifications</b></td>
      <td>The bot sends every new order to your admin chat with the customer, delivery and items.</td>
    </tr>
    <tr>
      <td width="280"><b>Telegram Auth</b></td>
      <td>Secure login with cryptographic validation of Telegram data.</td>
    </tr>
    <tr>
      <td width="280"><b>Dynamic UI Sync</b></td>
      <td>The interface follows Telegram theme colors.</td>
    </tr>
    <tr>
      <td width="280"><b>Haptic Feedback</b></td>
      <td>Native touch feedback on key actions.</td>
    </tr>
    <tr>
      <td width="280"><b>i18n</b></td>
      <td>Translations with <code>next-intl</code>.</td>
    </tr>
  </tbody>
</table>

---

## 🛠 Tech Stack

<table>
  <thead>
    <tr>
      <th width="220" align="left">Area</th>
      <th align="left">Tools</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td width="220"><b>Framework</b></td>
      <td>Next.js 16 (App Router, Server Actions)</td>
    </tr>
    <tr>
      <td width="220"><b>UI</b></td>
      <td>React 19</td>
    </tr>
    <tr>
      <td width="220"><b>Telegram Types</b></td>
      <td><code>@types/telegram-webapp</code> (strict typing)</td>
    </tr>
    <tr>
      <td width="220"><b>Authentication</b></td>
      <td>Auth.js v5 with a custom provider</td>
    </tr>
    <tr>
      <td width="220"><b>Database & ORM</b></td>
      <td>PostgreSQL, Prisma</td>
    </tr>
    <tr>
      <td width="220"><b>State</b></td>
      <td>Zustand (client), TanStack Query v5 (server)</td>
    </tr>
    <tr>
      <td width="220"><b>Validation</b></td>
      <td>Zod (shared between client and server)</td>
    </tr>
    <tr>
      <td width="220"><b>UI Components</b></td>
      <td>shadcn/ui + Radix UI, react-hot-toast</td>
    </tr>
    <tr>
      <td width="220"><b>Styling</b></td>
      <td>Tailwind CSS 4</td>
    </tr>
    <tr>
      <td width="220"><b>Testing & CI</b></td>
      <td>Vitest, GitHub Actions</td>
    </tr>
    <tr>
      <td width="220"><b>Architecture</b></td>
      <td>Feature-Sliced Design</td>
    </tr>
  </tbody>
</table>

---

## 🚀 Installation

<details>
<summary><b>Step-by-step guide</b></summary>

<br>

**1. Clone the repository**

```bash
git clone https://github.com/nfluvv/nxt-shop
cd nxt-shop
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

```bash
cp .env.example .env
```

Fill in the values in `.env`:

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Long random secret for Auth.js |
| `NEXTAUTH_URL` | Public URL of the app |
| `TELEGRAM_BOT_TOKEN` | Bot token from `@BotFather` |
| `TELEGRAM_WEBHOOK_SECRET` | Secret for incoming bot updates |
| `ADMIN_CHAT_ID` | Chat that receives new orders: your Telegram ID or a group ID |

> [!IMPORTANT]
> The bot can only write to chats that started a conversation with it. Open your bot and press **Start** from the admin account, or add the bot to the managers' group.

**4. Set up the database**

Make sure PostgreSQL is running, then run:

```bash
npx prisma generate
npx prisma migrate dev
```

**5. Fill the shop with demo data (optional)**

The seed creates categories, products with sizes and colors, collections, banners and delivery methods. You can run it as many times as you like.

```bash
npx tsx prisma/seed.ts
```

**6. Start the dev server**

To test the app inside Telegram, you need a public HTTPS URL. Use a tunnel like `ngrok`:

```bash
# Start the dev server (port 3000)
npm run dev

# In a second terminal, start the tunnel
npx ngrok http 3000
```

Copy the `https://...ngrok-free.app` URL. Then:

1. Add it to `.env` as `NEXTAUTH_URL`.
2. Set the same URL as the Mini App link in `@BotFather`.
3. Open your bot on your phone. HMR updates your code instantly.

> [!NOTE]
> After changing `schema.prisma`, run `npx prisma generate` and restart the dev server. Otherwise the app keeps using the old Prisma Client.

</details>

<details>
<summary><b>Prisma Studio (database viewer)</b></summary>

<br>

Use it to check orders, edit stock, add products or change roles by hand:

```bash
npx prisma studio
```

</details>

---

## 🏗 Architecture

> [!TIP]
> Each layer can only import from the layers below it. This keeps the code simple to read and easy to scale.

<details>
<summary><b>Project structure</b></summary>

<br>

```text
src/
├── app/          # Entry points, providers, styles, and layouts
├── views/        # Screens: main, catalog, product, saved, cart, checkout
├── widgets/      # Product rails, banners, categories, gallery, infinite list
├── features/     # User actions: add to cart, save product, filters, checkout
├── entities/     # Domain models and Prisma queries
├── shared/       # UI kit, TWA SDK hooks, DB client, Telegram API
└── auth.ts       # Custom Telegram data validation for login

app/              # Next.js routing layer
```

</details>

<details>
<summary><b>Public API of a slice</b></summary>

<br>

Every slice has two entry points:

- `index.ts` exports UI, types and schemas. It is safe to import in client components.
- `server.ts` exports Prisma queries and starts with `import "server-only"`. It cannot leak into the client bundle.

```ts
import { ProductCard } from "@/entities/product"
import { getProducts } from "@/entities/product/server"
```

Server Actions live in `features/*/api/actions.ts`. They always read the current user from the session, never from arguments.

</details>

<details>
<summary><b>Data model</b></summary>

<br>

```text
User ──< CartItem >── ProductVariant >── Product ──< ProductImage
  │                                         │
  ├──< SavedProduct >───────────────────────┤
  │                                         └── Category (tree)
  └──< Order ──< OrderItem
         └── DeliveryMethod
```

- Prices are stored as integers in minor units (kopecks, cents).
- `OrderItem` keeps a snapshot of the title, size, color, image and price, so editing the catalog never changes past orders.
- Stock lives on `ProductVariant`, one row per size and color combination.

</details>

<details>
<summary><b>How an order is created</b></summary>

<br>

1. The user is taken from the session.
2. The input is validated with Zod on the server.
3. One database transaction:
   - reads the cart with current prices and stock;
   - stops if any item is unavailable or exceeds stock;
   - clears the cart and checks the row count (protects from double submit);
   - decrements stock with a conditional update (`stock >= quantity`);
   - creates the order with a snapshot of all items.
4. After the commit, the bot notifies the manager. A Telegram failure never breaks the order.

</details>

---

## 💰 License

Released under the **MIT License**. The full text is in the repository.