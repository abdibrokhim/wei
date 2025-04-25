# example app from play market: HabitNow – dark-mode UI

> note: this is just an example of how the app might look like. i got this idea from the play market.

**App shown:** _HabitNow – dark-mode UI_ (3 consecutive mobile screens)

---

## Global UI foundations
| Layer | Purpose | Key visual cues |
|-------|---------|-----------------|
| **System status bar** | Device info, time, battery | White glyphs on black |
| **App bar (top)** | Navigation & utilities | Hamburger ☰, screen title, tiny calendar icon |
| **Accent color** | Primary actionable items | Deep magenta / rose (#E0487F approx.) |
| **Dark surface** | Focus on colored states | Almost-black background (#121212) |
| **Rounded geometry** | Habit tokens, FAB, tabs | Consistent 16-24 dp corner radius |

---

## Screen ①  **Today**
1. **Horizontal date-carousel (hero component)**  
   *Placement:* directly under app bar.  
   *Content:* 7 day chips (Mon → Sun) with today highlighted in magenta, past days in grey, future in grey-out.  
   *UX:* thumb-swipeable; quick jump to any day.

2. **Daily habit list (vertical)**  
   - **Habit row cell**  
     | Sub-element | Notes |
     |-------------|-------|
     | Left icon (house / lotus) | Encodes category (Home / Mindfulness) |
     | Title (Make bed) | 16 sp, medium weight |
     | Sub-label “Habit” | 12 sp, low-opacity pink |
     | Completion toggle | Right-aligned ✓ or ✕ inside circular chip (green when done, magenta/red when missed) |

3. **Floating Action Button (+)**  
   *Bottom-right docked*; launches habit/task wizard.

4. **Persistent bottom nav bar**  
   Tabs (Today • Habits • Tasks • Categories • Timer) with icons + labels; current tab tinted pink.

5. **Premium badge (mini sticky pill)**  
   Docked above nav on left; advertises upgrade.

---

## Screen ②  **Habits (catalog)**
1. **Habits list header**  
   Same app bar, plus search 🔍 icon.

2. **Habit summary card**  (one per habit)  
   - **Header row**: Title + “Every day” frequency badge.  
   - **7-Day mini-calendar**: Gold (missed), Green (done), Grey (future) circular tokens.  
   - **Footer row**:  
     | Element | Meaning |
     |---------|---------|
     | 🔗 chain-icon + streak length | Longest continuous streak |
     | % progress indicator | Days completed ÷ planned |
     | small calendar icon | Opens full history view |
     | kebab ⋮ menu | Edit / Delete |

3. **FAB** again fixed bottom-right.

---

## Screen ③  **Habit detail**
1. **Secondary app bar**  
   Back arrow ←, habit icon, share/export icon.

2. **Segmented tabs (Calendar • Statistics • Edit)**  
   Magenta underline denotes active tab.

3. **Monthly calendar grid**  
   - Colored habit states (same legend).  
   - Month navigation chevrons ‹ › in line with title “July 2023”.

4. **Streak panel**  
   Below calendar; magenta label “Streak” with counter (“4 DAYS”) in larger font.

5. **Notes section**  
   Chat-bubble icon + “No notes for this month” placeholder; tap to add.

6. **Bottom nav bar** (unchanged).

---

### Interaction & UX considerations
- **Thumb-zone FAB** encourages quick habit creation on any screen.  
- **Color-coded dots** reduce cognitive load—user learns outcome at a glance.  
- **Carousel vs card hierarchy**: Today view focuses on _action_, Habits view on _analysis_.  
- **Segmented control** in detail screen keeps high-level metrics one tap away without deep navigation.  
- **Dark theme** boosts contrast for status dots and saves battery on OLED devices.