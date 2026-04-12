# Design System Document: Professional Futurism

## 1. Overview & Creative North Star: "Luminous Precision"
This design system is built to transform the sterile world of accounting into a high-end, editorial digital experience. The Creative North Star is **Luminous Precision**. 

We move away from the "standard dashboard" look—characterized by rigid grids and repetitive boxes—and embrace an aesthetic that feels like a high-end financial terminal from the near future. By leveraging intentional asymmetry, overlapping glass surfaces, and high-contrast typography scales, we create an environment that feels both authoritative (Trust) and cutting-edge (Innovation). The goal is to make the user feel like they are navigating a sophisticated data-stream rather than filling out a form.

---

## 2. Colors: The Chromatic Architecture
The color palette is built on a foundation of deep, ink-like darks contrasted with "light-emitting" neon accents.

### The Palette
*   **Primary (Electric Blue):** `#81ecff` - Used for high-priority data points and active interaction states.
*   **Secondary (Vibrant Purple):** `#bf81ff` - Used for secondary highlights and to provide depth in gradients.
*   **Tertiary (Acid Lime):** `#f4ffc6` - Reserved for "Success" states and innovative "Call-outs" that need immediate attention.
*   **Background / Surfaces:** Rooted in `#0c0e12`.

### The "No-Line" Rule
Standard UI relies on 1px solid borders to separate sections. **This design system prohibits them.** To create a high-end feel, boundaries must be defined through:
1.  **Tonal Shifts:** Placing a `surface-container-low` component on a `surface` background.
2.  **Negative Space:** Using the spacing scale to create clear mental models of grouping.
3.  **Luminescent Edges:** Using subtle outer glows (`primary` at 10% opacity) to define a container’s edge without a hard stroke.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of frosted glass.
*   **Level 0 (Background):** `#0c0e12` (The abyss).
*   **Level 1 (Sections):** `surface-container-low` (#111318).
*   **Level 2 (Cards/Modules):** `surface-container` (#171a1f).
*   **Level 3 (Floating Elements):** `surface-container-highest` (#23262c).

### The "Glass & Gradient" Rule
To achieve "Professional Futurism," use semi-transparent `surface` colors (approx. 60-80% opacity) with a `backdrop-blur` of 20px. For primary CTAs, never use a flat color. Instead, use a linear gradient: `primary` (#81ecff) to `primary-container` (#00e3fd) at a 135-degree angle.

---

## 3. Typography: The Editorial Voice
Our typography balances the technical (Space Grotesk) with the functional (Manrope).

*   **Display & Headlines (Space Grotesk):** This typeface carries the "Innovation" weight. Its geometric, slightly tech-leaning construction should be used for large data points and page titles.
    *   *Usage:* `display-lg` (3.5rem) should be used for account balances or hero statements to create an editorial, high-fashion impact.
*   **Body & Labels (Manrope):** This typeface carries the "Trust" weight. It is highly legible and sophisticated.
    *   *Usage:* All transactional data, table rows, and descriptions must use Manrope to ensure the user feels grounded in professional accuracy.

---

## 4. Elevation & Depth: Tonal Layering
We do not use traditional "Drop Shadows" which can feel muddy on dark backgrounds.

*   **The Layering Principle:** Depth is achieved by "stacking" the surface tiers. An inner module should always be a step "Higher" in the container scale than its parent to feel closer to the user.
*   **Ambient Glows:** For floating modals or "active" cards, replace shadows with an ambient glow. Use the `primary` or `secondary` color at 5% opacity with a blur radius of 40px–60px.
*   **The "Ghost Border" Fallback:** If a component requires a defined edge for accessibility (e.g., an input field), use the `outline-variant` token at 20% opacity. It should look like a faint reflection on glass, not a drawn line.

---

## 5. Components: Primatives for Chill Numbers

### Buttons (The Kinetic Trigger)
*   **Primary:** Gradient of `primary` to `primary-container`. Corner radius: `md` (0.375rem). Interaction: On hover, add a `primary` outer glow (8px blur).
*   **Secondary:** Ghost style. Transparent background with a `secondary` "Ghost Border" (20% opacity). Text in `secondary`.

### Input Fields (Precision Entry)
*   **Style:** `surface-container-high` background. No border.
*   **Active State:** The bottom edge illuminates with a 2px `primary` line and a subtle "neon pulse" animation.
*   **Error State:** Background shifts slightly toward `error-container` (#9f0519) with text in `error`.

### Cards & Data Lists
*   **Constraint:** No divider lines.
*   **Layout:** Use `title-md` (Manrope) for labels and `headline-sm` (Space Grotesk) for numerical values.
*   **Separation:** Use vertical white space (24px - 32px) and subtle shifts between `surface-container-low` and `surface-container-high` to separate data sets.

### Chips (Categorical Tags)
*   **Selection Chips:** Use `secondary-container` with `on-secondary-container` text. Use `full` (9999px) roundedness for a sleek, organic feel.

### Animated Component: "The Pulse"
For real-time accounting updates, use a small 8px circle with a `tertiary` (#f4ffc6) fill and a continuous expanding ring animation (opacity 100% -> 0%) to indicate "Live" data streaming.

---

## 6. Do's and Don'ts

### Do:
*   **Embrace Asymmetry:** Align text to the left but allow large display numbers to bleed into the right-hand gutters for a custom editorial look.
*   **Use Motion:** All transitions (hover, page entry) must use a `cubic-bezier(0.22, 1, 0.36, 1)` easing for a "snappy yet smooth" futuristic feel.
*   **Vary Opacity:** Use `on-surface-variant` at 60% for helper text to keep the visual hierarchy clear.

### Don't:
*   **Don't use pure black:** Use the `background` token (#0c0e12) to ensure the neon accents don't feel "cheap" or "gaming-inspired."
*   **Don't use 100% opaque borders:** This breaks the "Glass" illusion and flattens the UI.
*   **Don't clutter:** High-end accounting requires "breathing room." If the screen feels busy, increase the spacing rather than adding more containers.
*   **Don't use standard icons:** Use ultra-thin (1pt) stroke icons to match the crispness of the typography.