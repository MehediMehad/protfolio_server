import { Buffer } from 'buffer';
import httpStatus from 'http-status';
import ApiError from '../../errors/ApiError';
import { google } from 'googleapis';
import { GoogleAuth } from "google-auth-library";
import { JWT } from "google-auth-library";
import { getEnvVar } from '../../utils/getEnvVar';

// Function to get Zoom Access Token using Account-level OAuth credentials
const getZoomAccessToken = async (): Promise<string> => {
  // Load credentials from environment variables
  const clientId = process.env.ZOOM_CLIENT_ID!;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET!;
  const accountId = process.env.ZOOM_ACCOUNT_ID!;

  if (!clientId || !clientSecret || !accountId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Zoom credentials missing');
  }

  // Create Base64 encoded string for Basic Auth header
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  // Make POST request to Zoom OAuth endpoint to get access token
  const url = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new ApiError(httpStatus.BAD_REQUEST, `Failed to get Zoom access token: ${errorData}`);
  }

  const data = await response.json();
  return data.access_token;
};

// Function to create a Zoom meeting for the authenticated user
export const createZoomMeeting = async (payload: {
  topic: string;
  start_time: string;
  duration: number;
}) => {
  // Get Zoom access token
  const token = await getZoomAccessToken();
  console.log('Zoom Access Token:', token);

  // Make POST request to Zoom API to create a meeting
  const res = await fetch('https://api.zoom.us/v2/users/me/meetings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic: payload.topic,
      type: 2, // Scheduled meeting
      start_time: payload.start_time,
      duration: payload.duration,
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        waiting_room: true,
      },
    }),
  });

  if (!res.ok) {
    const errorData = await res.text();
    throw new ApiError(httpStatus.BAD_REQUEST, `Failed to create Zoom meeting: ${errorData}`);
  }

  const data = await res.json();

  // Return relevant meeting details
  return {
    join_url: data.join_url,
    start_url: data.start_url,
    meeting_id: data.id,
  };
};


// Reuse OAuth client
// const getGoogleAuth = () => {
//   const oauth2Client = new google.auth.OAuth2();
//   oauth2Client.setCredentials((global as any).googleTokens);
//   return oauth2Client;
// };



// const auth = new JWT({
//   email: "meeting-bot@portfolio-next-16.iam.gserviceaccount.com",
//   key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDi4CipgdGb2peC\nTwrfwN4PuDLwB47MYI7g8npjspT9MqCLkEHSC7yf2J+YP+kFhP0LxFQLAEvMpQhh\naHuDl0s9Mpkdb5ziJsaNInblRSREZrpDYNflBa0ikJITHfWB2O2bgcQ00QrvGUBK\nmqtYp80+iOb0KuyjKeg/SV3fVCaoLBvZ9WQ+O6rblOxwpBN4on1ib4rJCSsp6s/g\n1cZoYsnMHhTKSZCRjF7mDf2q03SsMXig2f0U91xX6PTWCIU4DwBZ4w7gwZXOsNqk\n4ejUqV72mLzOQ2cE1+TzxYU5cMp3I8I1DZnMa060xKoeNyn77pOYrcE8IBxwM6rz\nDjsRwxxdAgMBAAECggEAFhehZgYx8NULoWEMjEbV6N51OVnnDiBN8XozME+kwfYi\n24xH2IoTi1Y3DkaU7JhrYrCyxWJ5PxuH8iJQOrtqFHK/pbXnZz9C4N3tCXze3/lH\n5IVC6LaRijbdPpbRgBwtYRH1FvaPM8K397vReR/X9OG0aazfX7EWQElm5nclj4UT\nFWauRnheEMJA+yFIwnHgA4reUR+5wCY8ITlLadPknYARtQLv3+qQBPn83xJH24VZ\n11D/FKvyVHYLhIeqJxJ5MX3nRBNqyEbJDJ52MPFdUwK5YX71fTDaNUB77FlUKHpZ\nhN6AZxs/4+YzZOkdAsATFwX/6dlDOc83VnJWElCq4QKBgQD6p2KHkQR78XWw/7FT\nRNaMzNvi06RnCBAkjMsZ27W1bYdXfO/j8ub8YY01UnmBMljf2R870OZWLVrWHxs8\nQDLjRt75HCXSkUuKX5/kFm/7Dn04z7PF5gIhfTxU0bU5CF4wtFzFsljjVZdGKwpU\nC/PVFptJln+Fj+3wSpYkXBbT4QKBgQDntvDIZIrpHEWxOMHlWV5PDpYoqnfgKsze\nZUOKatPK0GLNldnssDLXPSY4brBhYJXxNzbDPquGS5go0gRQOrxIPR9FsgxW34Fc\nSeQCDymqLAoM1fYxQ/edNbQN50veilHrMI+5JpJN4bnW1UJwwRzHEY7GPLYJnEAv\n/HOdf3qX/QKBgB01ZjjwADrFP3a5xRsz+WB8+t6q1Qygluj7cyt3O+yBb/UU/Qtu\nIdalM4RUMQ6KJGspbQdWZ5EBRgWPqGfT/1oWxyL2Ub4A6nGchRBaQQBbhuIY6hUU\noYjvhBlKOrkDrZ41Vl4/UzZiofcuSszSe76IHN5taDzTMeH/fxGLnalhAoGBANBu\nt1kLWAko7WflbkUohrUGofwim4KB/Zdv77lrLuiZWscjrMxEEveage7xYqe1gith\nR1mJ3jEHfu/5OvgQXZ19ncvLxV2/31VtAjT3/rqcss2pCbR3Nx2rWTPIg27Dbbzq\nCd6625BDJDAj1YgnrgNDv/KCWh16+CIyLK3YJibhAoGAcRzTBK+mtlCLz0XRB+OZ\nvFF4+tv4znbIMpAE1G3w0QMCPXBK/Fdx9whqCA+rs1GON8jzlAzMK+ReW/tvYIM9\nFJCsfo88FK2HWU41HOejmBjMjaQky7Lr8ko0pdOvCJST80ayJV7+r/I1ClP2JPJp\nynWPRJkgXgN2rQ5Z4gW6lP0=\n-----END PRIVATE KEY-----\n",
//   scopes: ['https://www.googleapis.com/auth/calendar'],
// });


// const calendar = google.calendar({
//   version: 'v3',
//   auth: (auth as unknown) as any,
// });

// export const createGoogleMeetEvent = async (payload: {
//   title: string;
//   description?: string;
//   startTime: string;
//   endTime: string;
//   attendeeEmail: string;
// }) => {
//   const event = {
//     summary: payload.title,
//     description: payload.description,
//     start: { dateTime: payload.startTime, timeZone: 'Asia/Dhaka' },
//     end: { dateTime: payload.endTime, timeZone: 'Asia/Dhaka' },
//     attendees: [{ email: payload.attendeeEmail }],
//     conferenceData: {
//       createRequest: { requestId: `meet-${Date.now()}` },
//     },
//     reminders: { useDefault: true },
//   };

//   const res = await calendar.events.insert({
//     // calendarId: process.env.GOOGLE_CALENDAR_ID!,
//     calendarId: "mdmehedihasanmehad@gmail.com",
//     requestBody: event,
//     conferenceDataVersion: 1,
//   });

//   return {
//     link: res.data.hangoutLink!,
//     eventId: res.data.id!,
//   };
// };




export const createGoogleMeetEvent2 = async () => {
  const auth = new GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL!,
      private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  const calendar = google.calendar({
    version: "v3",
    auth: (auth as unknown) as any,
  });

  const event = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: "Test Event",
      start: { dateTime: "2025-01-01T10:00:00+06:00" },
      end: { dateTime: "2025-01-01T11:00:00+06:00" },
    },
  });

  return event.data;
};


import fs from 'fs';

export const key = fs.readFileSync('google-private-key.txt', 'utf-8');

const formatPrivateKey = (key2: string): string => {
  // If the key contains literal \n, replace them with actual newlines
  if (key.includes('\\n')) {
    return key.replace(/\\n/g, '\n');
  }
  return key;
};

const auth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
  key: formatPrivateKey(process.env.GOOGLE_PRIVATE_KEY!),
  scopes: ["https://www.googleapis.com/auth/calendar"],
});



const calendar = google.calendar({
  version: "v3",
  auth: (auth as unknown) as any,
});

export const createGoogleMeetEvent = async (payload: {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  attendeeEmail: string;
}) => {
  const event = {
    summary: payload.title,
    description: payload.description,
    start: { dateTime: payload.startTime, timeZone: "Asia/Dhaka" },
    end: { dateTime: payload.endTime, timeZone: "Asia/Dhaka" },
    attendees: [{ email: payload.attendeeEmail }],
    conferenceData: { createRequest: { requestId: `meet-${Date.now()}` } },
    reminders: { useDefault: true },
  };


  const res = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID!,
    requestBody: event,
    conferenceDataVersion: 1,
  });

  return { link: res.data.hangoutLink!, eventId: res.data.id! };
};
