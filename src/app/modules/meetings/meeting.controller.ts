import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { MeetingServices } from "./meeting.service";


const bookMeeting = catchAsync(async (req, res) => {
    const userId = req.user.userId;
    const result = await MeetingServices.bookMeeting({ ...req.body, userId });
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Booking successfull',
        data: result
    });
});

export const MeetingControllers = {
    bookMeeting
}


