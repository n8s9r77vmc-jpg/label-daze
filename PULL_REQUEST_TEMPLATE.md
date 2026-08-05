Title: Fix auth flow for Safari: consolidate Firebase imports, wire signUp/signIn, add loading state and error messages

Summary

Fixes an issue where Create account / Sign in appeared to do nothing on iPhone Safari by consolidating Firebase auth imports into a single local module and wiring the signUp/signIn flows to show a loading state and display Firebase error messages.

Changes

- js/firebase-config.js — centralize firebase-auth imports and re-export helpers
- js/auth.js — use local firebase exports and expose signUp/signIn functions
- js/app.js — show loading state, surface Firebase errors, ensure preventDefault and DOM ID matches

Testing notes

Manual test checklist:
1. Open the app on iPhone Safari.
2. On the Create account form:
   - Enter email/password and tap Sign up.
   - Observe button text change to "Creating…" and inputs disabled while Firebase responds.
   - On success: app should sign in, hide auth forms, show product section and "Signed in as <email>".
   - On failure: an error message from Firebase should appear in the #auth-message area (red text).
3. On the Sign in form:
   - Tap Sign in and observe similar loading behavior and error messages.
4. Ensure the Create account / Sign in buttons actually call Firebase (createUserWithEmailAndPassword / signInWithEmailAndPassword) — create or sign in a test account.
5. Ensure sign out works and returns to auth forms.
6. Confirm no page reload occurs on submit.
7. Confirm product functionality still works when signed-in.

Reason

Safari can silently fail to load remote modules when they're imported multiple times; centralizing the imports reduces that risk and surfaces errors and user feedback.
