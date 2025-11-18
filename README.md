# Hotel-Management — In-Project Assistant

This repository contains a static Hotel Management demo site and a lightweight in-project assistant widget (no external AI services required).

## What I added
- `assistant.js` — a small client-side assistant that indexes the project's HTML pages and answers queries using simple keyword search and heuristics.
- `assistant.css` — styles for the assistant chat widget.
- Script tag injected into main pages so the assistant loads on:
  - `index.html`, `main.html`, `login.html`, `luxury-rooms.html`, `dining-hall.html`, `infinity-pool.html`, `food-beverages.html`

## How the assistant works
- On load the assistant fetches the listed HTML pages and builds a simple index of page text.
- It answers questions using rule-based heuristics (booking, prices, pool, dining, beverages) and falls back to a keyword search that returns matching sentences and sources.
- Important: No external AI or remote APIs are called; all responses come from local project files.

## Demo credentials (for the login page)
- Email: `admin@supremehotel.com`
- Password: `Admin@123`

## Run locally
1. Start a simple HTTP server in the repository folder (so fetch() can load pages):

```powershell
cd "c:\hotel management\Hotel-Management"
python -m http.server 8000
```

2. Open `http://localhost:8000/index.html` in your browser.

3. Click the assistant button (bottom-right) and ask questions like:
   - "How do I book a room?"
   - "What are the pool hours?"
   - "Show dining reservation options"

## Notes & next steps
- The assistant is intentionally local-only and simple. If you want richer natural-language answers, we can integrate a backend + LLM (securely) and add indexing improvements (TF-IDF, embeddings).
- I can also add a short `README` section describing how to extend the assistant.

---
Created and committed by the project assistant.
# Hotel Management System

## Description

A comprehensive Hotel Management System designed to streamline hotel operations and enhance guest experience. This system helps manage room bookings, guest information, staff management, billing, and other essential hotel operations efficiently.

## Features

- **Room Management**: Add, update, and delete room information including room types, availability, and pricing
- **Booking System**: Handle reservations, check-ins, and check-outs seamlessly
- **Guest Management**: Maintain detailed guest profiles and booking history
- **Billing & Invoicing**: Generate automated bills and manage payment processing
- **Staff Management**: Manage employee information and roles
- **Reports & Analytics**: Generate reports on occupancy rates, revenue, and other key metrics
- **User Authentication**: Secure login system for different user roles (admin, staff, guest)

## Installation

### Prerequisites

- [Add your prerequisites here, e.g., Python 3.8+, Node.js, Java, etc.]
- [Add database requirements, e.g., MySQL, PostgreSQL, MongoDB]
- [Add any other dependencies]

### Setup Instructions
# Hotel-Management — In-Project Assistant

This repository contains a static Hotel Management demo site and a lightweight in-project assistant widget (no external AI services required).

## Recent updates (Nov 2025)
- Added a compact `Nearby` button inside the assistant widget header. Clicking it opens Google Maps centered on the user's location (if geolocation is allowed); otherwise it opens a generic hotels search. This replaces the previous standalone "Nearby Hotels" UI.
- The old standalone Nearby Hotels UI (header select/button) and the larger `nearby-hotels.js` / `nearby-hotels.css` feature were removed/neutralized. If you need that feature restored, it can be recovered from git history or re-implemented.

## What is in this repo
- `assistant.js` — a client-side assistant that indexes the project's HTML pages and answers queries using simple keyword search and heuristics.
- `assistant.css` — styles for the assistant chat widget.
- The assistant is injected into main pages so it loads on:
  - `index.html`, `main.html`, `login.html`, `luxury-rooms.html`, `dining-hall.html`, `infinity-pool.html`, `food-beverages.html`

## How the assistant works
- On load the assistant fetches the listed HTML pages and builds a simple index of page text.
- It answers questions using rule-based heuristics (booking, prices, pool, dining, beverages) and falls back to a keyword search that returns matching sentences and sources.
- Important: No external AI or remote LLM APIs are called; all responses come from local project files.

## Assistant: Nearby button behavior
- Location: the button is in the assistant header (compact, right-aligned).
- Behavior: when clicked it attempts to get the browser geolocation and opens Google Maps with a hotels search centered on the detected coordinates. If geolocation is denied or unavailable, it opens a generic `https://www.google.com/maps/search/hotels` page.

## Demo credentials (for the login page)
- Email: `admin@supremehotel.com`
- Password: `Admin@123`

## Run locally
1. Start a simple HTTP server in the repository folder (so `fetch()` can load pages):

```powershell
cd "c:\hotel management\Hotel-Management"
python -m http.server 8000
```

2. Open `http://localhost:8000/index.html` in your browser.

3. Click the assistant button (bottom-right) and ask questions like:
   - "How do I book a room?"
   - "What are the pool hours?"
   - "Show dining reservation options"

## Notes & next steps
- The assistant is intentionally local-only and simple. If you want richer natural-language answers, we can integrate a backend + LLM (securely) and add indexing improvements (TF-IDF, embeddings).
- The legacy Nearby Hotels feature was removed to simplify the UI; if you want a restored in-widget list (without the old header controls), I can add a lightweight list that queries a remote API or a small backend proxy.

---
Created and maintained by the project team.

*Last Updated: November 2025*
