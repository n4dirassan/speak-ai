const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = 3000;

app.use(express.json());

/* =========================
   SERVIR O SITE
========================= */

app.use(express.static(path.join(__dirname, "..")));

/* =========================
   STATUS
========================= */

app.get("/api/status", (req, res) => {
    res.json({
        success: true,
        message: "Speak AI server is working!"
    });
});

/* =========================
   GROQ
========================= */

async function askGroq(messages) {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        throw new Error("GROQ_API_KEY not found.");
    }

    const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-20b",
                messages: messages,
                temperature: 0.4,
                max_tokens: 500
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error?.message ||
            "Groq API error."
        );
    }

    const reply =
        data.choices?.[0]?.message?.content;

    if (!reply) {
        throw new Error("Empty response from AI.");
    }

    return reply.trim();
}

/* =========================
   LEVEL TEST
========================= */

app.post("/api/level-test", async (req, res) => {
    try {
        const answers =
            Array.isArray(req.body.answers)
                ? req.body.answers
                : [];

        if (!answers.length) {
            return res.status(400).json({
                success: false,
                error: "No answers received."
            });
        }

        const numberedAnswers =
            answers
                .map(
                    (answer, index) =>
                        `${index + 1}. ${answer}`
                )
                .join("\n");

        const messages = [
            {
                role: "system",
                content: `
You are an English placement test evaluator.

Evaluate the student's English level.

Use CEFR levels:

A1, A2, B1, B2, C1, C2.

Evaluate:

- grammar
- vocabulary
- sentence structure
- communication
- English comprehension

Return ONLY valid JSON.
`
            },
            {
                role: "user",
                content: `
Student answers:

${numberedAnswers}

Return ONLY this JSON structure:

{
    "level": "A1",
    "score": 50,
    "strengths": ["strength"],
    "weaknesses": ["weakness"],
    "recommendation": "short recommendation"
}

Score must be between 0 and 100.
`
            }
        ];

        const reply = await askGroq(messages);

        let result;

        try {
            result = JSON.parse(reply);
        } catch {
            const match = reply.match(/\{[\s\S]*\}/);

            if (!match) {
                throw new Error(
                    "Invalid level test response."
                );
            }

            result = JSON.parse(match[0]);
        }

        res.json({
            success: true,
            result: result
        });

    } catch (error) {
        console.error(
            "Level test error:",
            error
        );

        res.status(500).json({
            success: false,
            error:
                error.message ||
                "Level test error."
        });
    }
});

/* =========================
   AI CHAT
========================= */

app.post("/api/test-ai", async (req, res) => {
    try {
        const message =
            String(
                req.body.message || ""
            ).trim();

        const level =
            String(
                req.body.level || "A1"
            );

        const history =
            Array.isArray(req.body.history)
                ? req.body.history
                : [];

        if (!message) {
            return res.status(400).json({
                success: false,
                error: "Message is empty."
            });
        }

        const lowerMessage = message.toLowerCase();

        const translationWords = [
            "translate",
            "translation",
            "traduz",
            "traduza",
            "tradução"
        ];

        const isTranslation =
            translationWords.some(word =>
                lowerMessage.includes(word)
            );

        let systemMessage;

        if (isTranslation) {

            systemMessage = `
You are an English-to-Portuguese translator.

The student wants a translation.

Translate the English text into natural,
clear and simple Portuguese.

IMPORTANT:

Return ONLY the Portuguese translation.

Do not explain.

Do not add English.

Do not add quotation marks.

Do not write "Translation:".

Do not add additional comments.
`;

        } else {

            systemMessage = `
You are Speak AI, a friendly personal English teacher.

The student's English level is ${level}.

Your main goal is to help the student improve
their conversational English.

IMPORTANT LANGUAGE RULES:

1. Speak mainly in English during the conversation.

2. Use simple and natural English appropriate
   for the student's level.

3. When the student makes a grammar,
   vocabulary or sentence mistake:

   - First show the corrected English sentence.
   - Then explain the correction in Portuguese.
   - Keep the Portuguese explanation simple.

4. Always explain important corrections in Portuguese.

5. Help with:

   - speaking
   - grammar
   - vocabulary
   - pronunciation
   - confidence

6. If the student's sentence is correct,
   do not invent a correction.

7. Keep the conversation natural.

8. Ask simple follow-up questions when appropriate.

9. Do not make the answer unnecessarily long.

10. Encourage the student to continue speaking English.

Example:

Student:
"I go to work yesterday."

Teacher:
"I went to work yesterday."

Em português:
Usamos "went" porque estamos falando de uma
ação que aconteceu no passado. O passado de
"go" é "went".

Then continue the conversation in English.
`;
        }

        const messages = [
            {
                role: "system",
                content: systemMessage
            }
        ];

        if (!isTranslation && history.length) {

            history
                .slice(-12)
                .forEach(item => {

                    if (
                        item &&
                        (
                            item.role === "user" ||
                            item.role === "assistant"
                        )
                    ) {

                        messages.push({
                            role: item.role,
                            content:
                                String(
                                    item.content || ""
                                )
                        });
                    }
                });
        }

        messages.push({
            role: "user",
            content: message
        });

        const reply =
            await askGroq(messages);

        res.json({
            success: true,
            reply: reply
        });

    } catch (error) {

        console.error(
            "AI error:",
            error
        );

        res.status(500).json({
            success: false,
            error:
                error.message ||
                "AI connection error."
        });
    }
});

/* =========================
   INICIAR SERVIDOR
========================= */

app.listen(PORT, "0.0.0.0", () => {
    console.log(
        `Speak AI server running on port ${PORT}`
    );
    console.log(
        `Network access: http://192.168.10.127:${PORT}`
    );
});