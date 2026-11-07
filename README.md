# Bite Sized Utilities

A cozy kitchen full of little utilities, refreshed for mobile and desktop. Explore the cupboards, search for a tool, pin favorites, or change the kitchen colors in settings.

## Run locally

Serve the project directory with any static web server, for example:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

The client-side files in `mirror/` were recovered from the publicly deployed site. `index.html` uses the original HTML with paths adjusted to those local assets; `kitchen-refresh.css` adds the new visual treatment without replacing the tools. The original development repository and any server-side code were not recovered, so some tools may still depend on external services.
