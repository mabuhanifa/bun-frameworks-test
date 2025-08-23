# GEMINI.md

## Project Overview

This is a web application built using the [Hono](https://hono.dev/) web framework. It is written in TypeScript and designed to be deployed on the Vercel platform. The application serves a simple text response at the root URL. The project is configured to use the Bun runtime for local development and `pnpm` as the package manager.

## Building and Running

This project is intended for deployment on Vercel, but can also be run locally for development.

### Local Development (Bun)

To run the development server using Bun:

1.  **Install dependencies:**
    ```bash
    pnpm install
    ```
2.  **Start the development server:**
    ```bash
    bun run dev
    ```
    This will start a server with hot-reloading, watching for changes in `src/index.ts`.

### Local Development (Vercel)

To simulate the Vercel environment locally:

1.  **Install dependencies:**
    ```bash
    pnpm install
    ```
2.  **Run the Vercel development server:**
    ```bash
    vc dev
    ```
    The application will be available at `http://localhost:3000`.

### Building and Deployment (Vercel)

The following commands are for building and deploying the application to Vercel:

1.  **Install dependencies:**
    ```bash
    pnpm install
    ```
2.  **Build the project:**
    ```bash
    vc build
    ```
3.  **Deploy to Vercel:**
    ```bash
    vc deploy
    ```

## Development Conventions

*   **Language:** TypeScript
*   **Framework:** Hono
*   **Package Manager:** pnpm
*   **Code Style:** The `tsconfig.json` is configured with `strict: true`, indicating a preference for strong typing.
*   **Entry Point:** The main application logic is in `src/index.ts`.
