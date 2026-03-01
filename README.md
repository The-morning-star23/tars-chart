# Tars Chat 💬 
**Tars Full Stack Engineer Internship Coding Challenge 2026 Submission**

A lightning-fast, real-time messaging web application built with Next.js, Convex, and Clerk. This project successfully implements requested features, including all core requirements and advanced bonus features like Group Chats, Message Reactions, and Soft Deletion.

---

## 🎥 Video Presentation
[**https://www.loom.com/share/d541cafc24ec4f5a9775210bd86876f0**]

## 🚀 Tech Stack
* **Framework**: Next.js (App Router)
* **Language**: TypeScript
* **Backend & Database**: Convex (Real-time syncing, WebSockets)
* **Authentication**: Clerk
* **Styling**: Tailwind CSS (Modern Dark Mode UI)

---

## ✨ Features Completed

### Core Requirements (10/10)
- [x] **1. Authentication**: Secure email/social login via Clerk. User profiles are synced to the Convex database.
- [x] **2. User List & Search**: Real-time search bar to find and filter registered users.
- [x] **3. One-on-One Direct Messages**: Instant messaging using Convex's real-time WebSocket subscriptions. Sidebar displays active chats with latest message previews.
- [x] **4. Message Timestamps**: Dynamic formatting (e.g., "2:34 PM" for today, "Feb 15, 2:34 PM" for older, and includes the year for past years).
- [x] **5. Empty States**: Beautiful, helpful UI states for empty searches, new chats, and zero active conversations.
- [x] **6. Responsive Layout**: Flawless switching between a desktop sidebar view and a mobile-first full-screen chat interface.
- [x] **7. Online/Offline Status**: Real-time presence system using a background heartbeat ping. Users automatically show as offline after 30 seconds of inactivity.
- [x] **8. Typing Indicators**: Live pulsing dots animation when the other user is typing, automatically clearing on send or after 1.5s of inactivity.
- [x] **9. Unread Message Count**: Accurate red notification badges on the sidebar that track unread messages using a backend `readReceipts` table.
- [x] **10. Smart Auto-Scroll**: Automatically scrolls to new messages unless the user is reading chat history, in which case a floating "↓ New Messages" button appears.

### Advanced / Bonus Features (4/4)
- [x] **11. Delete Own Messages**: Soft-delete functionality. Deleted messages show as an italicized *"This message was deleted"* for all participants.
- [x] **12. Message Reactions**: Hover over any message to add or remove emoji reactions (👍 ❤️ 😂 😮 😢).
- [x] **13. Loading & Error States**: Sleek UI skeleton loaders for fetching data, and a robust `try/catch` wrapper for message sending that displays a red "Retry" banner on failure.
- [x] **14. Group Chats**: Users can create custom group chats with multiple members. The UI seamlessly adapts to show group names, member counts, and the names of individual senders above their messages.

---

## 💻 Running the Project Locally

### Prerequisites
You will need Node.js installed, as well as accounts with [Clerk](https://clerk.com/) and [Convex](https://www.convex.dev/) to set up your environment variables.

### 1. Clone the Repository
```bash
git clone https://github.com/The-morning-star23/tars-chart
cd tars-chat
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env.local` file in the root directory and add your keys:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Convex deployment URL
CONVEX_DEPLOYMENT=your_convex_deployment
NEXT_PUBLIC_CONVEX_URL=your_convex_url
```

### 4. Start the Convex Backend
In a new terminal window, run:
```bash
npx convex dev
```

### 5. Start the Next.js Frontend
In your main terminal window, run:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧠 Schema Architecture Highlight

To accommodate both 1-on-1 and Group chats while maintaining accurate unread counts, the Convex database relies on a highly scalable structure:

- **conversations**: Tracks participants. Uses an `isGroup` boolean to dynamically switch between strict two-participant logic and multi-member arrays.
- **messages**: Belongs to a conversation. Contains `isDeleted` flags and a reactions array.
- **presence**: Tracks an `updatedAt` timestamp for the real-time online heartbeat.
- **readReceipts**: Stores the exact timestamp a specific user last viewed a specific conversation, allowing the backend to accurately calculate unread badges across multiple devices.

---

## 👨‍💻 Developed By
Shubh Kumar