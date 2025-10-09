# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Russian-language landing page and quiz application for an AI readiness assessment tool. The project helps users determine their readiness to adopt AI technologies and provides personalized recommendations based on their responses.

## Tech Stack

- **Frontend**: Pure JavaScript (Vanilla JS), HTML5, CSS3
- **Styling**: Custom CSS with gradient themes, no frameworks
- **Storage**: LocalStorage for client-side data persistence
- **Language**: Russian (all UI text and content)
- **Build**: No build process - static HTML/CSS/JS files served directly

## Application Architecture

### Page Flow

The application follows a multi-page flow:

1. **index.html** (Landing page) → 2. **test.html** (Quiz) → 3. **contact.html** (Contact form) → 4. **results.html** (Results with personalized strategy)

Each page has its own JavaScript file that handles page-specific logic and styling.

### Data Flow

```
test.js → Collects answers → localStorage('testData')
  ↓
contact.js → Validates form → Combines with testData → Calculates results
  ↓
localStorage('testResults' + 'fullUserData')
  ↓
results.js → Displays personalized recommendations based on profile type
```

### Key Components

**Test System (test.js)**
- Dynamic single-question display (13 questions total)
- Questions organized into 4 blocks (роли/препятствия/решения/личный запрос)
- Progress tracking and keyboard navigation
- Answers stored in localStorage as testData object

**Scoring System (contact.js:110-222)**
- Vector-based scoring across 3 archetypes:
  - **Optimizer** (Системный Оптимизатор) - Efficiency-focused
  - **Strategist** (Дальновидный Практик) - Long-term vision
  - **Pioneer** (Энтузиаст-Экспериментатор) - Innovation-driven
- Each answer contributes weighted points to archetype scores
- Final readiness score: 0-100 scale
- Client type classification: hot/warm/cold based on score thresholds

**Results Generation (results.js:86-335)**
- Three distinct personalized strategies (one per archetype)
- Multi-step development plans (3 steps each)
- Speedometer visualization with animated needle
- Gift recommendations based on client type

### Styling Architecture

**Global Styles (styles.css)**
- Dark gradient background: `#0f0f23 → #1a1a2e → #16213e`
- Accent gradients: `#ff6b6b → #4ecdc4 → #45b7d1`
- Inter font family throughout
- Mobile-responsive with breakpoints at 768px and 480px

**Page-Specific Styling**
- Each JS file injects its own CSS via `document.createElement('style')`
- Consistent design language across pages (cards, buttons, gradients)

## Development Commands

This is a static site with no build process. To work with it:

**Local Development**
```bash
# Serve locally (use any static server)
python -m http.server 8000
# or
npx serve .
```

**File Structure**
```
.
├── index.html          # Landing page
├── test.html          # Quiz interface
├── contact.html       # Contact form
├── results.html       # Results display
├── script.js          # Landing page logic
├── test.js            # Quiz logic
├── contact.js         # Form validation & scoring
├── results.js         # Results display logic
└── styles.css         # Global styles
```

## Important Implementation Details

### LocalStorage Keys

- `testData` - User's quiz answers (object with q1-q13)
- `testResults` - Calculated results including score, profileType, recommendations
- `fullUserData` - Combined test data and contact form data

### Profile Types

When working with the scoring system, remember:
- Profile determination is based on highest vector score
- Minimum readiness score varies by type (60-70 base)
- Each profile has distinct messaging in `generatePersonalizedMessage()`

### Question ID Mapping

Questions use IDs q1-q13, but answer values in testData may be:
- Option text (for older implementation)
- 'A', 'B', 'C', 'D' (for current implementation)

The scoring logic in contact.js expects letter format (A/B/C/D).

### Mobile Responsiveness

- Hero text scales down at 480px breakpoint
- Contact form switches to single column at 768px
- Test navigation buttons stack vertically on mobile

## Localization

All user-facing content is in Russian:
- Meta tags and SEO content
- UI labels and button text
- Error messages and validation feedback
- Personalized recommendations and strategies

When editing text, maintain the informal/professional Russian tone ("вы" form).

## Common Tasks

**Modifying Questions**
Edit the `questions` array in test.js:7-26. Each question object has:
- `id`, `block`, `text`, `type` ('radio' or 'textarea'), `options`

**Adjusting Scoring Logic**
Modify point allocation in contact.js:128-189. Each answer contributes to archetype vectors.

**Changing Personalized Strategies**
Edit the strategy templates in results.js:86-335. Three separate HTML templates for each profile type.

**Styling Updates**
- Global styles: Edit styles.css
- Page-specific: Modify the `style.textContent` in respective JS files
