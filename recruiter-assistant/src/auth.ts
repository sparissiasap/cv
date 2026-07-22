import { google } from "googleapis";
import fs from "fs";
import readline from "readline";

const SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.compose",
    "https://www.googleapis.com/auth/gmail.send"
];

const TOKEN_PATH = "credentials/token.json";

export async function authorize() {

    /*
      GitHub Actions mode
    */
    if (
        process.env.GOOGLE_CLIENT_SECRET_JSON &&
        process.env.GOOGLE_TOKEN_JSON
    ) {

        console.log("Using GitHub Actions OAuth credentials");

        const credentials = JSON.parse(
            process.env.GOOGLE_CLIENT_SECRET_JSON
        );

        const token = JSON.parse(
            process.env.GOOGLE_TOKEN_JSON
        );

        const {
            client_id,
            client_secret,
            redirect_uris
        } = credentials.installed;

        const oAuth2Client =
            new google.auth.OAuth2(
                client_id,
                client_secret,
                redirect_uris[0]
            );

        oAuth2Client.setCredentials(token);

        return oAuth2Client;
    }

    /*
      Local development mode
    */

    const credentials = JSON.parse(
        fs.readFileSync(
            "credentials/client_secret.json",
            "utf8"
        )
    );

    const {
        client_secret,
        client_id,
        redirect_uris
    } = credentials.installed;

    const oAuth2Client =
        new google.auth.OAuth2(
            client_id,
            client_secret,
            redirect_uris[0]
        );

    if (fs.existsSync(TOKEN_PATH)) {

        const token = JSON.parse(
            fs.readFileSync(
                TOKEN_PATH,
                "utf8"
            )
        );

        oAuth2Client.setCredentials(token);

        return oAuth2Client;
    }

    const authUrl =
        oAuth2Client.generateAuthUrl({
            access_type: "offline",
            scope: SCOPES
        });

    console.log("\nAutoriza la aplicación aquí:");
    console.log(authUrl);

    const code = await askCode();

    const { tokens } =
        await oAuth2Client.getToken(code);

    oAuth2Client.setCredentials(tokens);

    fs.writeFileSync(
        TOKEN_PATH,
        JSON.stringify(tokens, null, 2)
    );

    return oAuth2Client;
}

function askCode(): Promise<string> {

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => {

        rl.question(
            "\nPega el código de autorización: ",
            answer => {
                rl.close();
                resolve(answer);
            }
        );

    });
}