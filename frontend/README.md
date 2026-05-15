# Frontend Setup

## Prerequisites

- Node.js 16+
- npm or yarn

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with the following variables:
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your_microsoft_client_id
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Running the Frontend

### Development
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

## Environment Variables

- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth Client ID
- `NEXT_PUBLIC_MICROSOFT_CLIENT_ID` - Microsoft OAuth Client ID
- `NEXT_PUBLIC_API_URL` - Backend API URL

## Project Structure

```
frontend/
├── pages/              # Next.js pages
│   ├── _app.js        # App wrapper with auth provider
│   ├── index.js       # Home page
│   ├── create.js      # Create quiz page
│   ├── api/
│   │   └── auth/[...nextauth].js
│   └── quiz/
│       └── [id].js    # Quiz interface
├── components/        # Reusable components
│   ├── Header.jsx
│   ├── QuizCreationForm.jsx
│   ├── QuizQuestion.jsx
│   ├── QuizResults.jsx
│   └── QuizTimer.jsx
├── styles/           # Global styles
│   └── globals.css
├── utils/            # Utility functions
│   ├── api.js        # API client
│   └── store.js      # Zustand store
└── package.json
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the `frontend` directory to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

See [Vercel Documentation](https://vercel.com/docs) for more details.
