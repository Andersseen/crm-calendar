/**
 * Environment configuration for Web Preview
 *
 * IMPORTANT: This file contains placeholder values for the demo.
 * In production, these should be loaded from environment variables
 * and not committed to version control.
 */

export const environment = {
  production: false,

  /**
   * Google Calendar API Configuration
   *
   * To set up Google Calendar integration:
   * 1. Go to https://console.cloud.google.com/
   * 2. Create a new project or select existing
   * 3. Enable Google Calendar API
   * 4. Create OAuth 2.0 credentials
   * 5. Add authorized JavaScript origins (e.g., http://localhost:4201)
   * 6. Copy Client ID and API Key here
   */
  googleCalendar: {
    clientId: '', // Add your Google OAuth Client ID here
    apiKey: '', // Add your Google API Key here (optional for this implementation)
    scope: 'https://www.googleapis.com/auth/calendar.events',
  },

  /**
   * Demo mode configuration
   */
  demo: {
    enabled: true,
    showGoogleCalendarSetup: true,
  },
};

/**
 * Instructions for setting up Google Calendar:
 *
 * 1. Visit Google Cloud Console: https://console.cloud.google.com/
 * 2. Create a new project
 * 3. Navigate to "APIs & Services" > "Library"
 * 4. Search for "Google Calendar API" and enable it
 * 5. Go to "APIs & Services" > "Credentials"
 * 6. Click "Create Credentials" > "OAuth client ID"
 * 7. Select "Web application" as the application type
 * 8. Add authorized JavaScript origins:
 *    - http://localhost:4201 (for development)
 *    - https://your-domain.com (for production)
 * 9. Copy the Client ID and paste it above
 * 10. No API Key is needed for this implementation
 *
 * Note: The first time you connect, Google will show a warning that the app
 * is not verified. This is expected for development. For production, you'll
 * need to go through Google's app verification process.
 */
