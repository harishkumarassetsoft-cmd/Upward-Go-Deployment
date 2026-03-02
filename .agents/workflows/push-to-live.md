---
description: Push local development changes to the live Render deployment
---

// turbo-all

## Steps

1. Stage all changed files in git:

```
git -C c:\Upward-Go add -A
```

1. Commit with a descriptive message (use the date and short summary of changes):

```
git -C c:\Upward-Go commit -m "chore: update [YYYY-MM-DD] - [brief description of changes]"
```

Note: Replace the commit message with the actual date and a brief summary of what changed.

1. Push to the main branch on GitHub (uses stored PAT credentials):

```
git -C c:\Upward-Go push origin main
```

1. Confirm the push succeeded. Render will automatically detect the push and begin re-deploying both the backend and frontend services. This typically takes 3–5 minutes.

2. Verify the live deployment is up by visiting the Render dashboard or checking the live URLs.
