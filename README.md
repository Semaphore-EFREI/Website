# Semaphore Website

Frontend web application built with **Vue.js**.

This repository contains the website for the Semaphore solution.  
It is a Vite + Vue 3 + Pinia frontend that calls the Semaphore API at https://semaphore.deway.fr.

---

## Prerequisites

Make sure you have the following installed on your machine:

- **Node.js** 18+ (LTS recommended)
- **npm** (comes with Node.js)

To check:
```bash
node -v
npm -v
```

## Install dependencies
```bash
npm install
```

## Run (dev server)
```bash
npm run dev
```
Then open http://localhost:5173.

## Notes
- The app talks to the remote API at https://semaphore.deway.fr. You need valid credentials from that backend to log in.
- No extra environment variables are required locally; the API base URL is hardcoded in `src/stores/apiClient.js`.


