## Phases & Progress

This document tracks the product roadmap with clear milestones and progress.

Legend: [ ] not started, [~] in progress, [x] done

### Phase I – Foundation & Authentication [~]
- [x] Project setup (Expo + TypeScript)
- [x] Auth context, routes, onboarding/welcome
- [~] Supabase client wiring (.env, types, basic calls)
- [x] ESLint/Prettier configured
- [ ] CI (GitHub Actions)

### Phase II – Task Creation & Feed [~]
- [x] Create Task screen (title, description, category, reward, location)
- [x] Task list/feed and filtering
- [~] Persist to backend (Supabase) with validation
- [ ] My Tasks view

### Phase III – Offers & Task Lifecycle [ ]
- [ ] Offers schema and submit flow
- [ ] Accept/Reject offers
- [ ] Status transitions (Open → In Progress → Completed)

### Phase IV – Maps & Geo Discovery [~]
- [x] React Native Maps + Expo Location
- [x] Nearby tasks on map, basic filters
- [~] Marker clustering and route-based discovery

### Phase V – Payments (SINPE Móvil) [ ]
- [ ] Profile field for SINPE
- [ ] Send payment UI + confirmation
- [ ] Service fee + logs

### Phase VI – Profiles, Ratings & XP [ ]
- [ ] Public profiles
- [ ] Ratings after completion
- [ ] XP and badges

### Phase VII – Notifications [ ]
- [ ] Push tokens and subscriptions
- [ ] Realtime alerts (new task, offer updates)

### Phase VIII – Gamification & Mascot [ ]
- [ ] Mascot animations and daily missions
- [ ] Seasonal themes and rewards

### Phase IX – Accessibility & Themes [~]
- [x] Light/Dark mode
- [~] Colorblind modes
- [ ] Accessibility audits/tests

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
