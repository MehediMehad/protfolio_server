import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { MeetingServices } from "./meeting.service";


const createMeeting = catchAsync(async (req, res) => {
    const userId = req.user.userId;
    const body = req.body;
    const result = await MeetingServices.createMeeting(userId, body);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Meeting created successfully',
        data: result
    });
});

export const MeetingControllers = {
    createMeeting
}


