export function isRecruiterEmail(email: any): boolean {

    const from = email.from.toLowerCase();
    const subject = email.subject.toLowerCase();
    const body = email.body.toLowerCase();


    const text = `
        ${from}
        ${subject}
        ${body}
    `;


    // Nunca procesar correos propios
    if (
        from.includes("sergioparissireyes") ||
        from.includes("spr_123")
    ) {
        return false;
    }


    // Ignorar respuestas propias
    if (subject.startsWith("re:")) {
        return false;
    }


    // Ignorar remitentes automatizados
    const ignoredPatterns = [
        "no-reply",
        "noreply",
        "donotreply",
        "notifications",
        "dochub",
        "pricetravel"
    ];


    if (
        ignoredPatterns.some(x => from.includes(x))
    ) {
        return false;
    }


    // Ignorar confirmaciones automáticas de aplicaciones
    const applicationPatterns = [
        "tu postulación",
        "postulación enviada",
        "application submitted",
        "your application"
    ];


    if (
        applicationPatterns.some(x => text.includes(x))
    ) {
        return false;
    }


    // Señales de recruiter
    const strongSignals = [
        "recruiter",
        "hiring",
        "opportunity",
        "position",
        "role",
        "contract",
        "w2",
        "c2c",
        "interview",
        "job description",
        "developer",
        "engineer",
        "sitecore"
    ];


    const score = strongSignals.filter(
        x => text.includes(x)
    ).length;


    return score >= 1;
}