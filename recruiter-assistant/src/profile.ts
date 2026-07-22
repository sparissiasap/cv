import fs from "fs";
import path from "path";

const dataPath = path.resolve(
    "../src/assets/Sergio/data.json"
);

const content = fs
    .readFileSync(dataPath, "utf8")
    .replace(/^\uFEFF/, "");

const cv = JSON.parse(content);

export const profile = {
    name: cv.profile.name,

    title: cv.profile.title,

    summary: cv.summary.paragraphs
        .join("\n"),

    experience: cv.experience.jobs.map((job: any) => ({
        title: job.title,
        company: job.company,
        bullets: job.bullets
    })),

    skills: cv.sidebar
        .filter((x: any) => x.type === "expertise")
        .flatMap((x: any) =>
            x.skillGroups.flatMap((g: any) =>
                g.skills.map((s: any) => s.text)
            )
        ),

    certifications: cv.sidebar
        .filter((x: any) => x.type === "certifications")
        .flatMap((x: any) =>
            x.items.map((i: any) => i.name)
        ),

    website: cv.meta.shareUrl
};

console.log("CV loaded:", profile.name);
console.log("Skills:", profile.skills.length);