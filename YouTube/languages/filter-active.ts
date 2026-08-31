import { writeFileSync } from "node:fs";

import { languages } from "./languages";

const activeLanguages = languages.filter((lang) => lang.active);

const content = `export const activeLanguages = ${JSON.stringify(activeLanguages, null, 2).replace(/"speakers": (\d+)/g, '"speakers": $1')};
`;

writeFileSync("active-languages.ts", content);
console.log("Языки:", activeLanguages.map((l) => l.name).join(", "));
