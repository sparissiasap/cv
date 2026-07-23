import { google } from "googleapis";

export async function markAsRead(
    auth: any,
    messageId: string
) {

    const gmail = google.gmail({
        version: "v1",
        auth
    });

    try {

        await gmail.users.messages.modify({
            userId: "me",
            id: messageId,
            requestBody: {
                removeLabelIds: [
                    "UNREAD"
                ]
            }
        });

        console.log(
            "EMAIL MARKED AS READ:",
            messageId
        );

    }
    catch(error:any) {

        console.error(
            "MARK AS READ ERROR:"
        );

        console.error(
            error.response?.data || error.message
        );

        throw error;
    }
}
