import fs from "fs";
import path from "path";


const file =
    path.join(
        process.cwd(),
        "data",
        "processed.json"
    );


function ensureStorage() {
    const folder =
        path.dirname(file);

    if (!fs.existsSync(folder)) {
        fs.mkdirSync(
            folder,
            {
                recursive: true
            }
        );
    }

    if (!fs.existsSync(file)) {
        fs.writeFileSync(
            file,
            JSON.stringify([], null, 2)
        );
    }
}

export function getProcessedIds(): string[] {
    ensureStorage();

    const content =
        fs.readFileSync(
            file,
            "utf8"
        );

    if (!content) {
        return [];
    }

    return JSON.parse(content);
}

export function markProcessed(id: string) {
    const ids =
        getProcessedIds();

    if (!ids.includes(id)) {
        ids.push(id);
    }

    fs.writeFileSync(
        file,
        JSON.stringify(
            ids,
            null,
            2
        )
    );
}