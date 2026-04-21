# ConvoDoc ai Frontend

The frontend for ConvoDoc ai, built with Next.js 14, Tailwind CSS, and React Flow. It provides a modern, neomorphic interface for interacting with your documents.

## Features

- **Next.js 14**: App Router for efficient routing and server components.
- **Neomorphic Design**: Soft, modern UI aesthetics.
- **React Flow**: Interactive mind map visualization.
- **Chat Interface**: Real-time Q&A with typing indicators and markdown support.
- **Dashboard**: Manage uploaded documents and view status.

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env.local` file:
    ```env
    NEXT_PUBLIC_API_URL="http://localhost:8000"
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

4.  **Open Browser**:
    Visit `http://localhost:3000`.

## Docker

Build and run the frontend container:

```bash
docker build -t convodocai-frontend .
docker run -p 3000:3000 convodocai-frontend
```
