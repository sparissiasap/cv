import "dotenv/config";
const apiKey = process.env.GEMINI_API_KEY;

const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
);

const data = await response.json();

for (const model of data.models ?? []) {
  console.log(
    model.name,
    model.supportedGenerationMethods
  );
}