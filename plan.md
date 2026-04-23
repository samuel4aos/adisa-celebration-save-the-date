# Interactive Preview Component Implementation Plan

## 1. Goal
Develop a high-fidelity, responsive frontend interactive preview component that simulates real-time data fetching (REST) and live updates (WebSocket/SSE) for modified content like UI themes, configurations, and code snippets.

## 2. Technical Strategy
- **Component**: `PreviewDisplay.tsx` (Update existing)
- **Hooks**: `useRealTimePreview.ts` to handle simulated async fetching and real-time updates.
- **Styling**: Tailwind CSS for responsive Grid/Flexbox, Framer Motion for animations, Lucide React for icons.
- **Theme**: Dark Luxury (#020617 background, #d4af37 gold accents).

## 3. Implementation Steps

### Step 1: Update Constants & Types
- Enhance `PreviewItem` and `PreviewStatus` in `src/lib/constants.ts`.
- Add more diverse `MOCK_PREVIEWS`.

### Step 2: Create Custom Hook `useRealTimePreview`
- Implement `fetchPreviews` simulation with random delays and potential errors.
- Implement `subscribeToUpdates` simulation using `setInterval` to mimic WebSockets.
- Return `items`, `loading`, `error`, and `refetch` function.

### Step 3: Enhance `PreviewDisplay.tsx`
- Implement a professional "Live Status" header.
- Use the new hook for data.
- Add a "Recently Updated" scrolling ticker.
- Improve skeleton loaders for better UX.
- Add a modal or expanded view for "View Source" (Code Snippets).
- Ensure mobile-first responsive design (1 col mobile, 2 col tablet, 3 col desktop).

### Step 4: Integration Check
- Verify `AdminDashboard.tsx` correctly navigates to `PreviewDisplay`.
- Verify `App.tsx` routing.

## 4. Design Details
- **Colors**: Deep navy (#020617), Gold (#d4af37), Slate text (#f8fafc).
- **Interactions**: Hover effects on cards, pulsing "Live" indicators, smooth entry animations.
- **Responsiveness**: Use `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.
