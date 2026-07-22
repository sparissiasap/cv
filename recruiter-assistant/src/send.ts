import { google } from "googleapis";

export async function sendEmail(
    auth:any,
    to:string,
    subject:string,
    body:string
){

    const gmail = google.gmail({
        version:"v1",
        auth
    });

    const message = [
        `To: ${to}`,
        `Subject: ${subject}`,
        `Content-Type: text/plain; charset=utf-8`,
        "",
        body
    ].join("\r\n");

    const encodedMessage =
        Buffer
            .from(message)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");

    await gmail.users.messages.send({
        userId:"me",
        requestBody:{
            raw: encodedMessage
        }
    });

    console.log(
        "Email sent to:",
        to
    );
}