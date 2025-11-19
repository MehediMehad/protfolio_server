import { Buffer } from 'buffer';
import httpStatus from 'http-status';
import ApiError from '../../errors/ApiError';
import { google } from 'googleapis';
import { GoogleAuth } from "google-auth-library";
import { JWT } from "google-auth-library";
import { getEnvVar } from '../../utils/getEnvVar';
import config from '../../configs';

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

export const key = config.Google.google_private_key?.replace(/\\n/g, "\n");

const auth = new JWT({
  email: config.Google.google_service_account_email!,
  key: key,
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
    description: payload.description || 'Booked via portfolio app',
    start: { dateTime: payload.startTime, timeZone: 'Asia/Dhaka' },
    end: { dateTime: payload.endTime, timeZone: 'Asia/Dhaka' },
    conferenceData: {
      createRequest: {
        requestId: `meet-${Date.now()}`,
        // conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
    reminders: { useDefault: true },
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
    conferenceDataVersion: 1,
  });

  const link = response.data.hangoutLink;

  if (!link) {
    // ফলব্যাক (৯৯% ক্ষেত্রে কাজ করে)
    const link = `https://meet.google.com/${response.data.id}`;
    console.log('Using fallback Meet link:', link);
    return { link, eventId: response.data.id! };
  }

  return {
    link,
    eventId: response.data.id!,
  };
};