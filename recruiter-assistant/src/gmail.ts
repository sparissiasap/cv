import { google } from "googleapis";
import * as cheerio from "cheerio";

function decodeBody(data?: string | null) {

    if (!data) {
        return "";
    }

    return Buffer
        .from(data, "base64")
        .toString("utf-8");
}

function extractBody(payload: any): string {
    if (!payload) {
        return "";
    }


    // Email simple
    if (payload.body?.data) {

        const content = decodeBody(payload.body.data);

        if (payload.mimeType === "text/html") {

            const $ = cheerio.load(content);

            return $.text();
        }

        return content;
    }


    // Email multipart
    if (payload.parts) {


        // Primero texto plano
        for (const part of payload.parts) {

            if (part.mimeType === "text/plain") {

                const text = extractBody(part);

                if (text) {
                    return text;
                }
            }
        }


        // Después HTML limpio
        for (const part of payload.parts) {

            if (part.mimeType === "text/html") {

                const html = extractBody(part);

                if (html) {

                    const $ = cheerio.load(html);

                    return $.text();
                }
            }
        }
    }


    return "";
}

export async function getRecentEmails(auth: any) {

    const gmail = google.gmail({
        version: "v1",
        auth
    });


    const response =
        await gmail.users.messages.list({
            userId: "me",
            maxResults: 10,
            q: "newer_than:30d"
        });


    const messages =
        response.data.messages ?? [];


    const emails = [];


    for (const message of messages) {


        const detail =
            await gmail.users.messages.get({
                userId: "me",
                id: message.id!
            });



        const headers =
            detail.data.payload?.headers ?? [];



        const subject =
            headers.find(
                h => h.name === "Subject"
            )?.value ?? "";



        const from =
            headers.find(
                h => h.name === "From"
            )?.value ?? "";



        const body =
            extractBody(
                detail.data.payload
            );



        emails.push({
            id: message.id!,
            from,
            email: extractEmail(from),
            subject,
            body
        });

    }


    return emails;
}

function extractEmail(from:string){

    const match =
        from.match(/<(.+)>/);

    return match
        ? match[1]
        : from;

}