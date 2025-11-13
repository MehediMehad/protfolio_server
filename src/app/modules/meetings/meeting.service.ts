import prisma from '../../libs/prisma';
import { createZoomMeeting } from './meeting.utils';

const bookMeeting = async (payload: {
    userId: string;
    scheduleId: string;
    title: string;
    description?: string;
    platform: 'zoom' | 'google_meet';
}) => {
    const { userId, scheduleId, title, platform } = payload;

    // 1. Find and check if the schedule slot is available
    const schedule = await prisma.schedule.findUnique({
        where: { id: scheduleId },
    });

    if (!schedule || schedule.isBooked) {
        throw new Error('This slot is not available');
    }

    // 2. Calculate duration
    const duration = Math.round(
        (schedule.endTime.getTime() - schedule.startTime.getTime()) / 60000
    );

    // 3. Create Zoom/Google Meet meeting
    let meetingData: any = {};

    if (platform === 'zoom') {
        const zoomToken = process.env.ZOOM_JWT_TOKEN!; // or dynamic
        const zoom = await createZoomMeeting({
            topic: title,
            start_time: schedule.startTime.toISOString(),
            duration,
            accessToken: zoomToken,
        });
        meetingData = {
            platform: 'zoom',
            link: zoom.join_url,
            // extra: zoom
        };
    }

    // 4. Save to database (transaction)
    const result = await prisma.$transaction(async (tx) => {
        const meeting = await tx.meeting.create({
            data: {
                title,
                description: payload.description,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
                platform,
                link: meetingData.link,
                userId,
                scheduleId,
            },
        });

        await tx.schedule.update({
            where: { id: scheduleId },
            data: { isBooked: true },
        });

        return meeting;
    });

    return result;
};

export const MeetingServices = {
    bookMeeting
}