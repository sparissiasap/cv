import { authorize } from "./auth.js";
import { sendEmail } from "./send.js";

const auth = await authorize();

await sendEmail(
    auth,
    "correo-del-recruiter@gmail.com",
    "Test from AI Recruiter Assistant",
    "Hi, this is a test email."
);

console.log("Done");