# BharatBizMart — B2B Marketplace & Business Directory

A multi-tenant B2B marketplace (IndiaMART/TradeIndia/Justdial-style, original UI/branding)
built with Next.js 16 (App Router, JavaScript only), MongoDB/Mongoose, and JWT auth.
Every approved seller automatically gets a live mini business website on its own
subdomain, rendered dynamically from the same database — no per-vendor deployments.

## Stack

- Next.js 16 (App Router, Turbopack), React 19, JavaScript/JSX only
- Tailwind CSS v4
- MongoDB + Mongoose
- JWT in an HTTP-only cookie for auth
- Cloudinary for image/document uploads
- REST API routes under `app/api/*`

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in MONGODB_URI etc.
npm run seed                 # optional but recommended — see "Demo data" below
npm run dev
```

Open http://localhost:3000.

### Required environment variables

See `.env.example` for the full list. At minimum for local dev:

- `MONGODB_URI` — a local or Atlas MongoDB connection string
- `JWT_SECRET` — any long random string
- `NEXT_PUBLIC_ROOT_DOMAIN` — `bharatbizmart.com` in production, doesn't affect local dev
- `NEXT_PUBLIC_APP_URL` — `http://localhost:3000` for local dev

Optional (needed for the corresponding features to actually work, see "Known gaps" below):
`CLOUDINARY_*` (file uploads), `RAZORPAY_*` (real subscription payments), `SMTP_*` (email).

### Demo data

`npm run seed` wipes and repopulates the database with realistic Indian B2B data:
10 categories (30 subcategories), 50 vendors (45 approved with live websites, 5 pending
for the admin-approval demo), 100 products, 100 buyers, 100 enquiries+leads, 50 RFQs,
50 reviews, subscription plans, blog posts and CMS pages. It prints login credentials
when done — short version:

| Role | Email | Password |
|---|---|---|
| Super Admin | superadmin@bharatbizmart.com | password123 |
| Admin | admin@bharatbizmart.com | password123 |
| Vendor (approved, has products) | vendor1@bharatbizmart.com | password123 |
| Buyer | buyer1@bharatbizmart.com | password123 |

(`vendor1` … `vendor50`, `buyer1` … `buyer100` all use `password123`.)

Product images and vendor logos/covers are seeded with deterministic
`picsum.photos/seed/...` placeholders purely so the UI doesn't look empty in
a fresh checkout — they're not on-topic photography. Replace them with real
uploads via the vendor dashboard's `FileUpload` (Cloudinary) once real credentials
are configured.

## Multi-tenant subdomain architecture

This is one Next.js application serving thousands of vendor websites — there is no
per-vendor deployment.

```
proxy.js (Next 16's request-interception layer, formerly "middleware")
  reads the Host header
    - bharatbizmart.com / www / localhost           -> pass through untouched (marketplace)
    - <slug>.bharatbizmart.com or <slug>.localhost   -> rewrite to /sites/<hostname>/...
    - any other hostname (a connected custom domain) -> rewrite to /sites/<hostname>/...
```

The rewrite is invisible to the browser — the address bar keeps showing
`abc.bharatbizmart.com/...`. `app/sites/[domain]/layout.js` and its child pages call
`lib/tenant/getSiteContext.js` → `lib/tenant/resolveTenant.js`, which resolves the
hostname to a `Vendor` + `Website` document straight from MongoDB and 404s if the
tenant doesn't exist or isn't published. Nothing about the vendor's site is
statically generated per-vendor; it's all read from the DB at request time, so
onboarding a new seller never requires a deploy.

**Local testing**: subdomains work out of the box on `*.localhost`, e.g. after
seeding, visit `http://prime-corporation-1.localhost:3000`. No `/etc/hosts` edits
needed — `*.localhost` already resolves to `127.0.0.1` in modern browsers/OSes.

### Automatic website creation flow (spec section 40)

1. Seller completes the multi-step wizard at `/register-business`.
2. `POST /api/vendors/register` creates the `User` (role `vendor`), the `Vendor`
   (status `pending_approval`), a `Subscription`, and a `Website` document whose
   `subdomain` is the vendor's slug — reserved immediately, status `draft`.
3. Admin reviews the submission at `/admin/vendors` and clicks **Approve**
   (`PUT /api/admin/vendors/[id]`), which flips `Vendor.status` to `approved`
   **and** `Website.status` to `live` in the same request.
4. The subdomain starts resolving publicly the instant that happens — no extra step.

### Custom domains (Premium+ plans)

`/dashboard/website` lets a vendor add their own domain. `POST /api/domains` requires
the `customDomain` plan flag; it returns CNAME instructions
(`<their-domain> CNAME sites.<root-domain>`). `POST /api/domains/[id]/verify` does a
real DNS `CNAME` lookup (`node:dns`) before marking it verified — SSL issuance itself
is left to the hosting platform's domain API (e.g. Vercel Domains) once DNS is
confirmed, which is `sslStatus` on the `Domain` model.

## Tenant isolation

`lib/auth/guard.js`'s `requireVendorContext(user)` is the single choke point every
vendor-scoped API route goes through — it derives the vendor from the authenticated
session (`user.vendor`), never from a client-supplied id. Every vendor-scoped query
additionally filters by `vendor: vendor._id` (see `app/api/vendor/products/[id]/route.js`
for the pattern), so one vendor can never read or mutate another vendor's data even
if it guesses an object id — verified: a logged-in vendor hitting another vendor's
product id via `/api/vendor/products/[id]` gets a 404, not the data.

## Project structure

```
app/
  (marketplace)/        shared Header/Footer/CompareBar layout, plus everything public:
                         homepage, products/, categories/, suppliers/, companies/, services/,
                         rfq/, blog/, pages/[slug] (CMS), post-requirement/, register-business/,
                         compare/
                         ⚠️ any new public page MUST live inside this group, not as a
                         sibling of it — see "Gotchas" below for why.
  (auth)/                login/register layout
  account/               buyer dashboard (enquiries, RFQs, quotations, messages, saved,
                         addresses, notifications, support tickets) — has its own layout
  dashboard/             vendor dashboard (products, services, leads, enquiries, RFQs,
                         quotations, reviews, website builder, promote, team, analytics,
                         subscription, support, settings) — has its own layout
  admin/                 admin/super-admin panel (vendors, categories, products, users,
                         blog/CMS, reviews, banners, advertisements, coupons, support
                         tickets, settings) — has its own layout
  sites/[domain]/        the dynamically rendered vendor mini-website (home/about/products/
                         services/gallery/certifications/reviews/contact + sitemap.xml +
                         robots.txt)
  api/                   all REST endpoints

components/
  ui/                    Button, Badge, Rating, Pagination, EmptyState, Skeleton, SocialIcons
  marketplace/           Header (+ CategoriesMegaMenu, NotificationBell, AccountNav), Footer,
                         cards, CompareToggle/CompareBar, search/filters, enquiry & review modals
  dashboard/, admin/     shells + forms for the private panels
  vendor-site/           header/footer/contact-form for the tenant mini-sites
  shared/                cross-role components: ChatWindow, ConversationList,
                         NotificationsList, SupportTickets/SupportThread
  AuthProvider.js        session context (fetches /api/auth/me)
  CompareProvider.js     localStorage-backed "compare products" context (max 4 items)

lib/
  db/connect.js          cached Mongoose connection (+ registers all models, see below)
  auth/                  password hashing, JWT, session/cookie helpers, route guards
  tenant/                resolveTenant.js (hostname -> tenant) + getSiteContext.js
  pdf/                   generateQuotationPdf.js, generateCatalogPdf.js (pdf-lib)
  utils/                 slugs, pagination, sanitization, in-memory rate limiter, adPackages.js

models/                 28 Mongoose models (see below) + index.js
scripts/seed.js         demo data generator (includes placeholder product/logo images)
proxy.js                Next 16's request-interception layer (subdomain routing)
```

### Why `lib/db/connect.js` imports `models/index.js`

Turbopack can compile different routes into separate module graphs. A route that
populates a `ref: "User"` field without directly importing the `User` model in that
same file can hit Mongoose's `MissingSchemaError`, because the model registry is
populated lazily on import. `models/index.js` imports every model for its side
effects, and `connectDB()` (called at the top of every route) imports it — so the
full schema registry always exists before a query runs, regardless of which route
executes first.

## Database models

`User, Vendor, Website, WebsiteTemplate, Domain, Category, SubCategory, Product,
Service, Branch, Location, Enquiry, Lead, RFQ, Quotation, Conversation, Message,
Review, SubscriptionPlan, Subscription, Payment, Invoice, Advertisement, Banner,
Notification, Verification, Blog, BlogCategory, Page, Coupon, SupportTicket, AuditLog`

`Vendor` is the tenant root — business profile, verification, branches, employees,
categories, analytics counters and subscription plan all live on it.

## What's fully wired vs. what's a foundation for the next iteration

**Fully functional, backed by real DB writes and API calls** (not mocked): auth
(JWT + httpOnly cookie), seller onboarding → admin approval → live subdomain, product
CRUD + marketplace search/filtering/pagination, enquiries → leads (CRM with notes/
status/follow-up), RFQ posting → vendor quotations (with GST/discount/total calc) →
buyer accept/reject, reviews + vendor replies + admin moderation, buyer↔vendor chat
(polling-based — see below), notifications, file uploads to Cloudinary, vendor
website builder (template/theme/content) + publish flow, custom domain connect +
DNS verification, subscription plan upgrade (creates real `Payment`/`Invoice` records),
admin vendor/product/user/review moderation, blog/CMS (`Page` model, no hardcoded
static content), per-vendor dynamic `sitemap.xml`/`robots.txt`, JSON-LD (Product/
LocalBusiness/BreadcrumbList/Article schemas) + dynamic metadata throughout.

Also fully wired, added in the feature-parity pass against IndiaMART/TradeIndia/
Justdial: **product compare** (`/compare`, up to 4 products, localStorage-backed —
see `CompareProvider`), **downloadable PDF quotations**
(`GET /api/quotations/[id]/pdf`, pdf-lib, no external service), **auto-generated
vendor product catalog PDF** (`GET /api/vendors/[slug]/catalog`, regenerated live
from current listings — the same "always up to date" catalog IndiaMART/TradeIndia
sellers get), **self-serve "Promote my business"** (`/dashboard/promote` — Featured
Supplier / Featured Product / Sponsored Listing packages, the Star Supplier /
Super Seller style upsell, with the homepage Featured Suppliers section actually
prioritizing active promotions), **team/employee management**
(`/dashboard/team`), **support ticket system** (raise from `/account/support` or
`/dashboard/support`, thread + resolve from `/admin/support`), and full admin CMS
screens for **banners, advertisements and coupons** (`/admin/banners`,
`/admin/advertisements`, `/admin/coupons` — coupons apply a real discount in the
subscription checkout flow).

**Foundation laid, needs a real provider wired in to go further:**
- **Payments**: `/api/vendor/subscription` and `/api/vendor/advertisements` activate
  immediately and record real `Payment`/`Invoice` rows when `RAZORPAY_KEY_ID` isn't
  set, so the rest of the app (plan limits, custom domains, promotions) is testable
  end-to-end. Wire the actual Razorpay/Stripe checkout redirect in those routes
  before charging real money.
- **Chat**: polling every 4s (`components/shared/ChatWindow.js`) against
  `Conversation`/`Message` models — genuinely functional, not a stub, but the spec's
  ask for Socket.IO would replace the polling `GET` with a socket subscription; the
  data model and API don't need to change.
- **SMS/Email OTP, WhatsApp Business API, SSL issuance for custom domains, TI
  Logistics-style shipping integration**: these require a real telecom/hosting/
  logistics provider account, so the code path stops where a provider's API key
  would plug in (search `.env.example` for the relevant vars).
- **Multi-language UI**: TradeIndia's app supports Hindi/Punjabi/Gujarati/etc.; this
  build is English-only — would need next-intl or similar plus translated content.

## Gotchas hit during this build (worth knowing before you extend it)

- **`app/(group)/` only wraps routes actually nested inside it.** A page placed as
  a *sibling* of a route group folder (e.g. `app/products/` next to
  `app/(marketplace)/`) does NOT inherit that group's `layout.js` — it silently
  falls back to the root layout with no Header/Footer. Every public page was
  originally created this way and had to be moved inside `(marketplace)/`. If a
  new public page ever renders without the site chrome, this is the first thing
  to check.
- **`app/_sites/` is not a route.** Next.js treats any top-level segment starting
  with `_` as a private folder excluded from routing — the entire vendor
  mini-website tree silently 404'd until it was renamed to `app/sites/`. Never
  prefix a real route segment with `_`.
- **Mongoose 9 removed callback-style `next()` middleware.** A `schema.pre("save", function (next) { ...; next(); })` throws `TypeError: next is not a function` at runtime, not at write-time — write hooks as a plain (optionally async) function that just returns (see `models/Quotation.js`).
- **A custom component's own unconditional display class can beat a `hidden` override with equal CSS specificity**, since Tailwind's cascade order (not the order classes are written) decides the winner. `<Button className="hidden sm:inline-flex">` lost to the `inline-flex` baked into `Button`'s own base classes, so the button stayed visible on mobile. Fix: wrap the component in a plain element that owns the visibility classes (`<span className="hidden sm:inline-flex"><Button /></span>`) instead of passing them into a component that already hardcodes a `display` utility.

## Security notes

- Passwords hashed with bcrypt; sessions are JWTs in an httpOnly, `sameSite: lax`
  cookie (`secure` in production) — never in localStorage.
- Every private API route runs through `requireUser([roles])` / `requireVendorContext`
  (`lib/auth/guard.js`); tenant id is always derived server-side from the session,
  never trusted from the client.
- Basic in-memory rate limiting on auth/enquiry/contact endpoints
  (`lib/utils/rateLimit.js` — swap for Redis-backed before running multiple instances).
- Mongo query sanitization helper for any place a raw client filter might reach a
  query (`lib/utils/sanitize.js`).
