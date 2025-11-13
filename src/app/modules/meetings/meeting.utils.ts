import axios from 'axios';

export const createZoomMeeting = async (payload: {
    topic: string;
    start_time: string; // ISO
    duration: number; // minutes
    accessToken: string;
}) => {
    const response = await axios.post(
        'https://api.zoom.us/v2/users/me/meetings',
        {
            topic: payload.topic,
            type: 2, // scheduled
            start_time: payload.start_time,
            duration: payload.duration,
            settings: {
                host_video: true,
                participant_video: true,
                join_before_host: false,
                mute_upon_entry: true,
                waiting_room: true,
            },
        },
        {
            headers: {
                Authorization: `Bearer ${payload.accessToken}`,
                'Content-Type': 'application/json',
            },
        }
    );

    return {
        join_url: response.data.join_url,
        start_url: response.data.start_url,
        meeting_id: response.data.id,
    };
};