# TeamSync

A real-time team collaboration app with chat and video call features.

## Features

- 🔐 Secure Authentication
- 💬 Real-time Chat
- 📹 Video Calls
- 🌓 Dark/Light Mode
- 🔒 HTTP-Only Cookies
- 🛡️ Content Security Policy
- 📱 Responsive Design

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **State Management:** Zustand
- **Real-time:** Socket.IO
- **Video Calls:** WebRTC
- **Form Handling:** React Hook Form + Zod
- **Testing:** Vitest + Testing Library
- **Documentation:** Storybook

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/teamsync.git
cd teamsync
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```env
SOCKET_URL=your_socket_server_url
ANALYZE=true or false to run analyze bundle size
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) with your browser.

## Testing

Run unit tests:
```bash
npm test
```

Run Storybook:
```bash
npm run storybook
```

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
│   ├── global/      # Global components (navbar, etc)
│   ├── pages/       # Page-specific components
│   └── ui/          # Reusable UI components
├── lib/             # Utilities, hooks, and store
│   ├── actions/     # Server actions
│   ├── hooks/       # Custom hooks
│   ├── service/     # Services (WebRTC, etc)
│   ├── store/       # Zustand store
│   └── utils/       # Helper functions
└── test/            # Test utilities and setup
```