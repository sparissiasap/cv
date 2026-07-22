import { google } from "googleapis";

export async function createDraft(
    auth: any,
    to: string,
    subject: string,
    body: string
) {

    const gmail = google.gmail({
        version: "v1",
        auth
    });

    const message = [
        `To: ${to}`,
        `Subject: ${subject}`,
        "",
        body
    ].join("\n");

    const encodedMessage =
        Buffer
            .from(message)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");

    await gmail.users.drafts.create({
        userId: "me",
        requestBody: {
            message: {
                raw: encodedMessage
            }
        }
    });
}

export async function getDrafts(auth:any){

    const gmail = google.gmail({
        version:"v1",
        auth
    });

    const response =
        await gmail.users.drafts.list({
            userId:"me"
        });

    return response.data.drafts ?? [];
}