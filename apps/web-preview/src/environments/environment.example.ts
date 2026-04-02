/**
 * Example environment configuration
 *
 * 1. Copy this file to both `environment.ts` and `environment.prod.ts`
 * 2. Fill in your real Google OAuth Client ID
 * 3. Do NOT commit the files with real values
 */

export const environment = {
  production: false,

  googleCalendar: {
    clientId: 'YOUR_GOOGLE_OAUTH_CLIENT_ID_HERE',
    apiKey: '',
    scope: 'https://www.googleapis.com/auth/calendar.events',
  },

  demo: {
    enabled: true,
    showGoogleCalendarSetup: true,
  },
};
