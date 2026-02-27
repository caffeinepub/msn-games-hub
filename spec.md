# MSN Games Hub

## Current State
The app is a games hub with 84 games across 16 categories. It has:
- Tab cloaking with 14 presets and custom cloaking
- Panic button (Escape / Alt+P shortcuts)
- Custom backgrounds (12 themes + custom color)
- Favorites and recently played tracking
- Game modal with iframe embed
- Settings panel with 3 tabs (Cloak, Background, Panic)
- All data stored in localStorage

## Requested Changes (Diff)

### Add
- **Name lock screen**: On first visit (or when no name is stored), show a full-screen lock screen asking "What is your name?" with an input and a "Enter" button. Store the name in localStorage. The name persists across sessions.
- **In-app chat/messaging system**: A floating chat bubble button (bottom-center or near the bottom) that opens a chat panel. All users who have entered a name can send and receive messages in a shared public chat. Messages are stored in the backend canister so all users see the same chat in real-time (polling every 2 seconds). Each message shows the sender's name, message text, and timestamp.
- **Backend**: Simple messaging backend with functions to post a message and get all recent messages (last 100).

### Modify
- App renders only after name is confirmed (lock screen gates the main app).
- The chat panel shows the user's own messages on the right side, others on the left side (like a typical messaging UI).
- Username is displayed in the header next to the logo.

### Remove
- Nothing removed.

## Implementation Plan
1. Generate backend with `postMessage(name, text)` and `getMessages()` API.
2. Add lock screen component that shows before the main app if no username is saved.
3. Add floating chat button that opens a slide-up chat panel.
4. Wire frontend to backend for sending and polling messages every 2 seconds.
5. Show sender's name and timestamp on each message bubble.
6. Display logged-in username in the header.

## UX Notes
- Lock screen is minimal and centered — just the MSN logo, "What is your name?" prompt, and an input + button.
- Chat panel is a slide-up drawer from the bottom, ~400px tall, with message list and input box.
- Messages auto-scroll to bottom on new messages.
- Own messages are right-aligned in blue; others are left-aligned in gray.
- Chat button shows unread count badge when there are new messages.
