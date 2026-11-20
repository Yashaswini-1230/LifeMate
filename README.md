# LifeMate AI

**Your personal AI-powered life management companion.**

LifeMate AI is a mobile application designed to help users organize
everyday activities, build consistent habits, and manage their schedules
from one place.

## Features

-   **Authentication:** Sign up and log in using Firebase
    Authentication.
-   **Personalized onboarding:** Configure language, wake-up and sleep
    times, activities, and notification preferences.
-   **Daily tasks:** View and manage daily activities.
-   **Habit tracking:** Track habits and maintain streaks.
-   **Schedule management:** Organize activities and review upcoming and
    completed items.
-   **Reminders:** Support for notifications and reminders.
-   **AI integration:** AI-powered assistance using the Groq API.

Features and integrations may evolve during development.

## Tech Stack

  Area                 Technologies
  -------------------- --------------------------
  Mobile application   React Native, Expo
  Language             TypeScript
  Navigation           Expo Router
  Authentication       Firebase Authentication
  Cloud database       Cloud Firestore
  Local persistence    AsyncStorage
  AI                   Groq API
  Backend services     Cloudflare Workers, Hono
  Notifications        Expo Notifications

## Repository Structure

``` text
LifeMate/
├── mobile-app/       # Expo React Native application
├── README.md         # Main project documentation
└── LICENSE
```

## Getting Started

See [`mobile-app/README.md`](mobile-app/README.md) for installation,
environment configuration, and instructions to run the mobile
application.

## Security

-   Do not commit `.env` files or real API keys.
-   Keep local credentials private.
-   Use placeholder values in example configuration files.

## Collaboration

-   Create a separate branch for each feature or fix.
-   Make focused commits with clear messages.
-   Open a pull request to `main` for review before merging.

## License

See the [LICENSE](LICENSE) file for license information.
