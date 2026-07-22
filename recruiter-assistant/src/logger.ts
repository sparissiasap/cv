import fs from "fs";

export function logRecruiter(data:any){

    const line = `
${new Date().toISOString()}
${JSON.stringify(data,null,2)}
-----------------------
`;

    fs.appendFileSync(
        "logs/recruiter.log",
        line
    );
}