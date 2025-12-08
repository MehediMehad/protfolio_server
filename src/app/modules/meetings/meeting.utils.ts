import { Buffer } from 'buffer';

import httpStatus from 'http-status';

import config from '../../configs';
import { calendar } from '../../configs/google.config';
import ApiError from '../../errors/ApiError';

export const createGoogleCalenderEvent = async (payload: {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  meetingLink: string;
}) => {
  const event = {
    summary: payload.title,
    description: `${payload.description || ''}\n\nJoin Link: ${payload.meetingLink}`,
    start: { dateTime: payload.startTime, timeZone: 'Asia/Dhaka' },
    end: { dateTime: payload.endTime, timeZone: 'Asia/Dhaka' },
  };

  await calendar.events.insert({
    calendarId: config.Google.google_calendar_id,
    requestBody: event,
  });

  return true;
};

const ZoomAccessToken = async (): Promise<string> => {
  // Load credentials from environment variables
  const clientId = config.Zoom.client_id;
  const clientSecret = config.Zoom.client_secret;
  const accountId = config.Zoom.account_id;

  // Validate credentials
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
export const createZoomMeetingLink = async (payload: {
  topic: string;
  start_time: string;
  duration: number;
}): Promise<string> => {
  // Get Zoom access token
  const token = await ZoomAccessToken();
  console.log("date and time", payload.start_time);

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
  return data.join_url;
};

//* * THIS IS FOR PAID VERSION CREATE GOOGLE MEET LINK **//

// const auth = new JWT({
//   email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
//   key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
//   scopes: [
//     'https://www.googleapis.com/auth/calendar',
//     'https://www.googleapis.com/auth/meetings.space.created',
//   ],
// });

// const meet = google.meet('v2');

// export const createGoogleMeetLink = async () => {
//   const response = await meet.spaces.create({
//     auth,
//     requestBody: {},
//   });

//   const link = response.data.meetingUri!;
//   const code = response.data.meetingCode;

//   return {
//     link,
//     code,
//   };
// };
