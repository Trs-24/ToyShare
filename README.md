# ToyShare - Toy Exchange Platform

ToyShare is a platform for exchanging children's toys and items. It includes a backend API, a web admin/user panel, and a mobile application.

## Project Structure

This project is a monorepo managed by npm workspaces:

- `backend`: NestJS application (API)
- `web`: Next.js application (Admin & Web Client)
- `mobile`: React Native (Expo) application (Mobile Client)

## Prerequisites

- Node.js (v18+)
- npm (v9+)
- Docker (for PostgreSQL & Redis)

## Getting Started

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Start Backend**
    ```bash
    cd backend
    npm run start:dev
    ```

3.  **Start Web App**
    ```bash
    cd web
    npm run dev
    ```

4.  **Start Mobile App**
    ```bash
    cd mobile
    npm run start
    ```

## Development

-   **Linting**: `npm run lint` (Runs ESLint across all workspaces)
-   **Formatting**: `npm run format` (Runs Prettier across all workspaces)

## Tech Stack

-   **Backend**: NestJS, PostgreSQL, Redis
-   **Web**: Next.js (App Router), Tailwind CSS
-   **Mobile**: React Native (Expo)
