## Phases & Progress

This document tracks the product roadmap with clear milestones and progress.

Legend: [ ] not started, [~] in progress, [x] done

### Phase I – Foundation & Authentication [~]
- [x] Project setup (Expo + TypeScript)
- [x] Auth context, routes, onboarding/welcome
- [~] Supabase client wiring (.env, types, basic calls)
- [x] ESLint/Prettier configured
- [ ] CI (GitHub Actions)

### Phase II – Task Creation & Feed [x]
- [x] Create Task screen (title, description, category, reward, location)
- [x] Task list/feed and filtering
- [x] Persist to backend (Supabase) with validation
- [x] My Tasks view (map + list, create via modal)

### Phase III – Offers & Task Lifecycle [~]
- [x] Offers schema and submit flow
- [x] Detailed offers management view with profiles
- [x] Accept (assign) / Reject (auto) offers
- [x] Status transitions (Open → In Progress → Completed)
- [x] Owner “Finish Task” action (QR placeholder + button)
- [x] Worker “Cancel Job” with reason → task reopens

### Phase IV – Maps & Geo Discovery [x]
- [x] React Native Maps + Expo Location
- [x] Nearby/all tasks on map, basic filters
- [x] Overlap handling (grid/spiderfy expansion) and category reset fix

### Phase V – Payments (SINPE Móvil) [ ]
- [ ] Profile field for SINPE
- [ ] Send payment UI + confirmation
- [ ] Service fee + logs
 - [~] Wallet & history views (recent payments, details, map pin) — basic

### Phase VI – Profiles, Ratings & XP [~]
- [x] Public profiles (profile screen, user card usage across app)
- [ ] Ratings after completion
- [~] XP and badges (rank tiers, progress screen, badges display)

### Phase VII – Notifications [~]
- [x] Push token registration & persistence
- [x] Offer-created → notify owner (deep link to task)
- [x] Worker cancel → notify owner
- [x] Task completed → notify owner & worker
- [ ] Realtime updates via Supabase (websockets)

### Phase VIII – Gamification & Mascot [~]
- [x] Chambito “queen” variant for loading overlays (giant)
- [~] Mascot component usage across UI
- [ ] Daily missions
- [ ] Seasonal themes and rewards

### Phase IX – Accessibility & Themes [~]
- [x] Light/Dark mode
- [~] Colorblind modes
- [ ] Accessibility audits/tests

### Phase X.a – Map & Device Compatibility [x]
- [x] Amazon Fire compatibility (OSM tiles fallback)
- [x] Graceful location fallback to default region
- [x] Google Maps API key wired for iOS/Android builds

### Phase X – Admin Dashboard & CI/CD [ ]
- [ ] Next.js admin dashboard
- [ ] User/task moderation tools
- [ ] CI pipeline and release automation

### Phase XI – Monetization [ ]
- [ ] Task boosts & subscriptions
- [ ] Analytics and invoicing

### Phase XII – Productivity Tools [ ]
- [ ] Templates, recurring tasks
- [ ] Calendar sync

### Phase XIII – Chat & Secure Comms [ ]
- [ ] In-app chat with media
- [ ] Voice notes and anonymized calls

### Phase XIV – Community & Social [ ]
- [ ] Public stories, reactions
- [ ] Leaderboards and challenges

### Phase XV – AR, Marketplace & Expansion [ ]
- [ ] AR overlays, marketplace, multi-worker

---

Principles:
- Ship real, integrated features per phase
- Maintain tests and accessibility as we go
- Non-destructive iteration; forward-only migrations
