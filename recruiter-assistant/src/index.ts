import { authorize } from "./auth.js";
import { getRecentEmails } from "./gmail.js";
import { isRecruiterEmail } from "./filter.js";
import { analyzeJob } from "./analyzer.js";
import { createDraft } from "./drafts.js";
import { sendEmail } from "./send.js";
import {
    getProcessedIds,
    markProcessed
} from "./storage.js";
import { config } from "./config.js";
import { logRecruiter } from "./logger.js";

const auth = await authorize();
const emails = await getRecentEmails(auth);

console.log(
    "Correos encontrados:",
    emails.length
);

const processed = getProcessedIds();

for (const email of emails) {

    try {

        if (!email.id) {
            continue;
        }

        if (processed.includes(email.id)) {
            continue;
        }

        if (!isRecruiterEmail(email)) {
            continue;
        }

        // Evitar conversaciones existentes
        if (
            email.subject
                .toLowerCase()
                .startsWith("re:")
        ) {
            console.log(
                "Skipping reply:",
                email.subject
            );

            markProcessed(email.id);
            continue;
        }

        console.log("\n====================");
        console.log("POTENTIAL RECRUITER");
        console.log("FROM:", email.from);
        console.log("SUBJECT:", email.subject);

        const analysis = await analyzeJob({
            subject: email.subject,
            body: email.body
        });

        console.log("\nAI ANALYSIS:");
        console.log(
            JSON.stringify(
                analysis,
                null,
                2
            )
        );

        if (
            analysis.decision === "RESPOND" &&
            analysis.isFirstContact &&
            analysis.score >= config.minimumScore &&
            analysis.response
        ) {

            const recruiterEmail =
                email.from.match(/<(.+)>/)?.[1];

            if (!recruiterEmail) {

                console.log(
                    "Could not extract recruiter email."
                );

                continue;
            }

            if (config.autoSend) {

                await sendEmail(
                    auth,
                    recruiterEmail,
                    `Re: ${email.subject}`,
                    analysis.response
                );

                console.log(
                    "EMAIL SENT:",
                    recruiterEmail
                );

            }
            else {

                await createDraft(
                    auth,
                    recruiterEmail,
                    `Re: ${email.subject}`,
                    analysis.response
                );

                console.log(
                    "DRAFT CREATED:",
                    recruiterEmail
                );

            }

            logRecruiter({
                from: email.from,
                subject: email.subject,
                score: analysis.score,
                decision: analysis.decision,
                draftCreated: !config.autoSend,
                emailSent: config.autoSend
            });

            // Solo si todo salió bien
            markProcessed(email.id);

        }
        else {

            console.log(
                "NO ACTION:",
                {
                    decision: analysis.decision,
                    firstContact: analysis.isFirstContact,
                    score: analysis.score,
                    minimumScore: config.minimumScore,
                    hasResponse: !!analysis.response
                }
            );

            // Ya analizamos este correo y decidimos no actuar
            markProcessed(email.id);

        }

    }
    catch (error) {

        console.error(
            "Error processing email:",
            email.subject
        );

        console.error(error);

        // No marcar como procesado.
        // Se volverá a intentar en la siguiente ejecución.

    }

}
