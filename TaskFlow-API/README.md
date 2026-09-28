# TaskFlow-API (front end)

The React front end for TaskFlow. Despite the folder name, this is the UI; the API server is [`../TaskFlow-Backend`](../TaskFlow-Backend).

Stack: React 19, Vite 7, Tailwind CSS 4.

```bash
npm install
npm run dev       # http://localhost:5173 (expects the back end on :4000)
npm run build     # production build into dist/
npm run lint
```

Point it at a different API with `VITE_API_BASE` in `.env.local`.

Full setup, the follow-along path and the deep dive are in the [root README](../README.md).
