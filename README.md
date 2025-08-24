# SuAuth — OpenSource License Management & Validation

A compact, production-ready license management system with a modern Next.js dashboard and a simple Python SDK for client-side validation. Clean UI, clear APIs, and practical logging built in.

- Dashboard: Next.js App Router + Tailwind CSS
- Database: MongoDB (with sensible indexes)
- SDK: Python for validation and HWID binding (with examples)

---

## Highlights
- Robust license lifecycle: create, list, delete
- License validation API with HWID support and rate-limiting surface (extensible)
- Logs: validation attempts (success/denied) with IP, HWID, timestamps
- Clean UI and API responses
- First Python SDK with examples

---

## Screenshots

<details>
<summary><strong>Main Menu</strong> (click to expand)</summary>

![Dashboard — Main](https://i.imgur.com/wjxR2F5.png)

</details>

<details>
<summary><strong>Licenses Menu</strong> (click to expand)</summary>

![Dashboard — Licenses](https://i.imgur.com/sQMw6dw.png)

</details>

---

## Quick Start

- Set environment variables >:
```
MONGODB_URI=...
MONGODB_DB=...
JWT_SECRET=...
```

- Install & run the server:
```
cd server
pnpm install
pnpm dev
# or: npm install && npm run dev
```

Server runs at: http://localhost:3000

Optional: Python SDK is included in `SDKs/python` if you need client-side validation.

## UI / Dashboard
- Licenses table with statuses: Active, Expired, Banned
- Creation form: Duration (seconds or quick select), HWID limit, optional note
- Logs table: time, IP, HWID, status, message

---

## TODO
- [ ] Bulk actions on licenses (multi-delete, ban)
- [ ] Filters and search on license list
- [ ] Optional rate limiting and audit exports
- [ ] UX polish: micro-animations and skeletons
- [ ] More SDKs (Node/Go) and packaging

### Note
These will be developed in my spare time. If you’d like to support the project, feel free to Fork and extend it yourself — and dropping a Star is always appreciated! ❤️

---

