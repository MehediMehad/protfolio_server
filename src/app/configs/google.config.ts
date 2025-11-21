import { google } from 'googleapis';
import { JWT } from "google-auth-library";
import config from ".";

const auth = new JWT({
    email: config.Google.google_service_account_email,
    key: config.Google.google_private_key?.replace(/\\n/g, "\n"),
    scopes: [
        "https://www.googleapis.com/auth/calendar",
        'https://www.googleapis.com/auth/meetings.space.created',
    ],
});


const calendar = google.calendar({
    version: "v3",
    auth: (auth as unknown) as any,
});

export { calendar };