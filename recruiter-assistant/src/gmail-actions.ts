import { google } from "googleapis";

export async function markAsRead(
    auth: any,
    messageId: string
) {

    const gmail = google.gmail({
        version: "v1",
        auth
    });

    await gmail.users.messages.modify({
        userId: "me",
        id: messageId,
        requestBody: {
            removeLabelIds: [
                "UNREAD"
            ]
        }
    });

}