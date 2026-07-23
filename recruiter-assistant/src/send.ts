import { google } from "googleapis";

const CV_URL = "https://sergioparissi.is-a.dev/sergio";

export async function sendEmail(
    auth: any,
    to: string,
    subject: string,
    body: string
) {

    const gmail = google.gmail({
        version: "v1",
        auth
    });


    const htmlBody = `
<html>
<body style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">

<p>
${body.replace(/\n/g, "<br/>")}
</p>

<br/>

<p>
You can find my updated CV and professional profile here:
</p>

<p>
<a href="${CV_URL}">
${CV_URL}
</a>
</p>

<br/>

<p>
Best regards,<br/>
<strong>Sergio Parissi Reyes</strong><br/>
Senior .NET / Sitecore Developer
</p>

</body>
</html>
`;


    const message = [
        `To: ${to}`,
        `Subject: ${subject}`,
        "Content-Type: text/html; charset=utf-8",
        "",
        htmlBody
    ].join("\r\n");


    const encodedMessage =
        Buffer
            .from(message)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");


    await gmail.users.messages.send({
        userId: "me",
        requestBody: {
            raw: encodedMessage
        }
    });


    console.log(
        "Email sent to:",
        to
    );

    console.log(encodedMessage);
}