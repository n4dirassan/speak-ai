/* =========================================================
   HASSAN.AI — MAIN SCRIPT
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const startTestButton = document.getElementById("startTestButton");
const testQuestions = document.getElementById("testQuestions");
const questionText = document.getElementById("questionText");
const questionNumber = document.getElementById("questionNumber");
const progressFill = document.getElementById("progressFill");
const answerInput = document.getElementById("answerInput");
const submitAnswer = document.getElementById("submitAnswer");
const menuToggle = document.getElementById("menuToggle");
const primaryNavigation = document.getElementById("primaryNavigation");


/* =========================================================
   LEVEL TEST
========================================================= */

const questions = [
    "What is your name?",
    "Where do you live?",
    "What do you do every day?",
    "What did you do yesterday?",
    "What are you doing right now?",
    "What do you like to do in your free time?",
    "Tell me about your family.",
    "What are your plans for the future?",
    "Describe your last holiday.",
    "Why do you want to learn English?"
];

let currentQuestion = 0;
let answers = [];
let userLevel = "A1";
let conversationHistory = [];


/* =========================================================
   VOICE
========================================================= */

let recognition = null;
let isListening = false;
let voices = [];


/* =========================================================
   MOBILE NAVIGATION
========================================================= */

function setMenuOpen(isOpen) {

    if (!menuToggle || !primaryNavigation) return;

    primaryNavigation.classList.toggle("is-open", isOpen);
    menuToggle.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute(
        "aria-expanded",
        String(isOpen)
    );
    menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Fechar menu" : "Abrir menu"
    );
}

if (menuToggle) {
    menuToggle.addEventListener("click", () => {
        const isOpen =
            menuToggle.getAttribute("aria-expanded") === "true";

        setMenuOpen(!isOpen);
    });
}

if (primaryNavigation) {
    primaryNavigation.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            setMenuOpen(false);
        });
    });
}

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        setMenuOpen(false);
    }
});


/* =========================================================
   START TEST
========================================================= */

if (startTestButton) {
    startTestButton.addEventListener("click", () => {

        startTestButton.hidden = true;
        startTestButton.setAttribute("aria-expanded", "true");

        if (testQuestions) {
            testQuestions.classList.remove("hidden");
        }

        currentQuestion = 0;
        answers = [];

        showQuestion();
    });
}


/* =========================================================
   SHOW QUESTION
========================================================= */

function showQuestion() {

    if (!questionText) return;

    questionText.textContent = questions[currentQuestion];

    if (questionNumber) {
        questionNumber.textContent =
            `Question ${currentQuestion + 1} of ${questions.length}`;
    }

    if (progressFill) {
        const percentage =
            ((currentQuestion + 1) / questions.length) * 100;

        progressFill.style.width = `${percentage}%`;
    }

    if (answerInput) {
        answerInput.value = "";

        setTimeout(() => {
            answerInput.focus();
        }, 100);
    }
}


/* =========================================================
   SUBMIT ANSWER
========================================================= */

if (submitAnswer) {
    submitAnswer.addEventListener("click", submitTestAnswer);
}

function submitTestAnswer() {

    if (!answerInput) return;

    const answer = answerInput.value.trim();

    if (!answer) {
        alert("Please answer the question.");
        answerInput.focus();
        return;
    }

    answers.push(answer);
    currentQuestion++;

    if (currentQuestion < questions.length) {
        showQuestion();
    } else {
        finishTest();
    }
}


/* =========================================================
   ENTER KEY
========================================================= */

if (answerInput) {

    answerInput.addEventListener("keydown", event => {

        if (event.key === "Enter") {
            event.preventDefault();
            submitTestAnswer();
        }

    });
}


/* =========================================================
   FINISH TEST
========================================================= */

async function finishTest() {

    if (!testQuestions) return;

    testQuestions.innerHTML = `
        <div class="question-card">
            <div class="result-icon">🤖</div>

            <h2>Analyzing your English...</h2>

            <p class="question-subtitle">
                Please wait while Hassan.AI analyzes your answers.
            </p>
        </div>
    `;
    testQuestions.setAttribute("aria-busy", "true");

    try {

        const response = await fetch("/api/level-test", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                answers
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.error || "Level test failed."
            );
        }

        userLevel =
            data.result?.level || "A1";

        showLevelResult(
            data.result || {}
        );

    } catch (error) {

        console.error("Level test error:", error);

        testQuestions.innerHTML = `
            <div class="question-card">

                <div class="result-icon">⚠️</div>

                <h2>Something went wrong</h2>

                <p class="question-subtitle">
                    ${escapeHTML(
                        error.message ||
                        "Could not analyze your level."
                    )}
                </p>

                <button
                    id="retryTest"
                    class="primary-button"
                    type="button"
                >
                    Try Again
                </button>

            </div>
        `;

        const retryButton =
            document.getElementById("retryTest");

        if (retryButton) {
            retryButton.addEventListener(
                "click",
                () => location.reload()
            );
        }
    } finally {
        testQuestions.setAttribute("aria-busy", "false");
    }
}


/* =========================================================
   LEVEL RESULT
========================================================= */

function showLevelResult(result) {

    if (!testQuestions) return;

    const strengths =
        Array.isArray(result.strengths)
            ? result.strengths
            : [];

    const weaknesses =
        Array.isArray(result.weaknesses)
            ? result.weaknesses
            : [];

    const level =
        result.level ||
        userLevel ||
        "A1";

    const score =
        Number(result.score) || 0;

    const recommendation =
        result.recommendation ||
        "Continue praticando e melhorando o seu inglês.";

    const levelMeanings = {
        A1: "Consegue compreender e usar expressões simples em situações do dia a dia.",
        A2: "Consegue comunicar-se em tarefas rotineiras e falar sobre temas familiares.",
        B1: "Consegue lidar com situações comuns e expressar ideias sobre temas conhecidos.",
        B2: "Consegue comunicar-se com mais fluência e compreender textos e conversas complexas."
    };

    const levelMeaning =
        levelMeanings[level] ||
        "O seu nível indica o ponto de partida para definir uma prática de inglês mais adequada.";

    const strengthsText =
        strengths.length
            ? strengths.map(item => `- ${item}`).join("\n")
            : "- Ainda não foram identificados pontos fortes específicos.";

    const weaknessesText =
        weaknesses.length
            ? weaknesses.map(item => `- ${item}`).join("\n")
            : "- Continue praticando para identificar novas áreas de melhoria.";

    const resultText = [
        "Resultado do teste de nível Hassan.AI",
        `Nível identificado: ${level}`,
        `Pontuação: ${score}%`,
        `O que este nível significa: ${levelMeaning}`,
        "",
        "Pontos fortes:",
        strengthsText,
        "",
        "Pontos a melhorar:",
        weaknessesText,
        "",
        `Recomendação de estudo/prática: ${recommendation}`
    ].join("\n");

    userLevel = level;

    testQuestions.innerHTML = `

        <div class="question-card">

            <div class="result-icon">🎓</div>

            <div class="question-label">
                O SEU NÍVEL
            </div>

            <h2>
                ${escapeHTML(level)}
            </h2>

            <div id="levelResult">
                ${escapeHTML(score)}%
            </div>

            <p class="question-subtitle">
                ${escapeHTML(levelMeaning)}
            </p>

            <div class="result-details">

                <div class="result-box">
                    <strong>Pontos fortes</strong>

                    <div class="result-list">
                        ${
                            strengths.length
                                ? strengths
                                    .map(
                                        item =>
                                            `• ${escapeHTML(item)}`
                                    )
                                    .join("<br>")
                                : "Ainda não foram identificados pontos fortes específicos."
                        }
                    </div>
                </div>

                <div class="result-box">
                    <strong>Pontos a melhorar</strong>

                    <div class="result-list">
                        ${
                            weaknesses.length
                                ? weaknesses
                                    .map(
                                        item =>
                                            `• ${escapeHTML(item)}`
                                    )
                                    .join("<br>")
                                : "Continue praticando para identificar novas áreas de melhoria."
                        }
                    </div>
                </div>

            </div>

            <div class="result-recommendation">
                <strong>Recomendação de estudo/prática</strong>
                <p>${escapeHTML(recommendation)}</p>
            </div>

            <div class="result-actions">
                <button
                    id="copyResult"
                    class="primary-button"
                    type="button"
                >
                    Copiar resultado
                </button>

                <span
                    id="copyResultStatus"
                    class="copy-result-status"
                    role="status"
                    aria-live="polite"
                ></span>
            </div>

            <button
                id="startLearning"
                class="primary-button"
                type="button"
            >
                Start practicing
            </button>

        </div>
    `;

    const startLearningButton =
        document.getElementById("startLearning");

    if (startLearningButton) {
        startLearningButton.addEventListener(
            "click",
            startLearning
        );
    }

    const copyResultButton =
        document.getElementById("copyResult");

    const copyResultStatus =
        document.getElementById("copyResultStatus");

    if (copyResultButton) {
        copyResultButton.addEventListener(
            "click",
            () => copyResultToClipboard(
                resultText,
                copyResultButton,
                copyResultStatus
            )
        );
    }
}


async function copyResultToClipboard(text, button, status) {

    let copied = false;

    try {
        if (
            navigator.clipboard &&
            typeof navigator.clipboard.writeText === "function"
        ) {
            await navigator.clipboard.writeText(text);
            copied = true;
        }
    } catch (error) {
        console.warn("Clipboard API unavailable:", error);
    }

    if (!copied) {
        const textArea = document.createElement("textarea");

        textArea.value = text;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();

        try {
            copied = document.execCommand("copy");
        } catch (error) {
            console.warn("Clipboard fallback unavailable:", error);
        }

        textArea.remove();
    }

    if (status) {
        status.textContent = copied
            ? "Resultado copiado!"
            : "Não foi possível copiar o resultado.";
    }

    if (button) {
        button.disabled = copied;

        if (copied) {
            window.setTimeout(() => {
                button.disabled = false;
            }, 1800);
        }
    }
}


/* =========================================================
   START LEARNING
========================================================= */

function startLearning() {

    if (!testQuestions) return;

    testQuestions.innerHTML = `

        <div class="question-card">

            <div class="result-icon">🤖</div>

            <div class="question-label">
                HASSAN.AI
            </div>

            <h2>
                Ready to practice?
            </h2>

            <p class="question-subtitle">
                Your level is
                <strong>${escapeHTML(userLevel)}</strong>.
                <br><br>
                Practice in English and receive
                simple corrections and explanations
                in Portuguese.
            </p>

            <button
                id="startConversation"
                class="primary-button"
                type="button"
            >
                Start practicing
            </button>

        </div>
    `;

    const startConversationButton =
        document.getElementById("startConversation");

    if (startConversationButton) {
        startConversationButton.addEventListener(
            "click",
            openChat
        );
    }
}


/* =========================================================
   OPEN CHAT
========================================================= */

function openChat() {

    if (!testQuestions) return;

    conversationHistory = [];

    testQuestions.innerHTML = `

        <div class="chat-app">

            <div class="chat-header">

                <div class="teacher-avatar">
                    AI
                </div>

                <div>
                    <strong>Hassan.AI</strong>

                    <span>
                        Online · Level ${escapeHTML(userLevel)}
                    </span>
                </div>

            </div>

            <div
                id="chat"
                class="chat-messages"
                aria-live="polite"
                aria-label="Mensagens da conversa"
            ></div>

            <div
                id="chatStatus"
                class="chat-status"
                aria-live="polite"
            >
                Ready to practice
            </div>

            <div class="chat-input-area">

                <button
                    id="micButton"
                    class="mic-button"
                    type="button"
                    title="Speak"
                    aria-label="Falar usando o microfone"
                    aria-pressed="false"
                >
                    🎤
                </button>

                <input
                    id="chatInput"
                    type="text"
                    placeholder="Type or speak in English..."
                    aria-label="Mensagem para Hassan.AI"
                    autocomplete="off"
                >

                <button
                    id="chatSend"
                    class="send-button"
                    type="button"
                    title="Send"
                    aria-label="Enviar mensagem"
                >
                    ➤
                </button>

            </div>

        </div>
    `;

    const firstMessage =
        "Hello! 👋 How are you today?";

    addAIMessage(firstMessage);

    conversationHistory.push({
        role: "assistant",
        content: firstMessage
    });

    const chatSend =
        document.getElementById("chatSend");

    const chatInput =
        document.getElementById("chatInput");

    const micButton =
        document.getElementById("micButton");

    if (chatSend) {
        chatSend.addEventListener(
            "click",
            sendChatMessage
        );
    }

    if (chatInput) {
        chatInput.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {
                    event.preventDefault();
                    sendChatMessage();
                }

            }
        );
    }

    if (micButton) {
        micButton.addEventListener(
            "click",
            toggleMicrophone
        );
    }

    loadVoices();
    setupSpeechRecognition();

    if (chatInput) {
        chatInput.focus();
    }

    setTimeout(() => {
        speakAI(firstMessage);
    }, 500);
}


/* =========================================================
   ADD AI MESSAGE
========================================================= */

function addAIMessage(message) {

    const chat =
        document.getElementById("chat");

    if (!chat) return;

    const row =
        document.createElement("div");

    row.className =
        "message-row ai-row";

    const avatar =
        document.createElement("div");

    avatar.className =
        "avatar-small";

    avatar.textContent =
        "AI";

    const bubble =
        document.createElement("div");

    bubble.className =
        "ai-bubble";

    bubble.appendChild(
        formatMessage(message)
    );

    row.appendChild(avatar);
    row.appendChild(bubble);

    chat.appendChild(row);

    chat.scrollTop =
        chat.scrollHeight;
}


/* =========================================================
   ADD USER MESSAGE
========================================================= */

function addUserMessage(message) {

    const chat =
        document.getElementById("chat");

    if (!chat) return;

    const row =
        document.createElement("div");

    row.className =
        "message-row user-row";

    const bubble =
        document.createElement("div");

    bubble.className =
        "user-bubble";

    bubble.textContent =
        message;

    row.appendChild(bubble);

    chat.appendChild(row);

    chat.scrollTop =
        chat.scrollHeight;
}


/* =========================================================
   SEND MESSAGE
========================================================= */

async function sendChatMessage() {

    const input =
        document.getElementById("chatInput");

    const chat =
        document.getElementById("chat");

    const status =
        document.getElementById("chatStatus");

    const sendButton =
        document.getElementById("chatSend");

    if (!input || !chat) return;

    const message =
        input.value.trim();

    if (!message) return;

    addUserMessage(message);

    input.value = "";

    conversationHistory.push({
        role: "user",
        content: message
    });

    if (status) {
        status.textContent =
            "Hassan.AI is thinking...";
        status.setAttribute("aria-busy", "true");
    }

    if (sendButton) {
        sendButton.disabled = true;
    }

    const thinking =
        document.createElement("div");

    thinking.id =
        "thinking";

    thinking.className =
        "message-row ai-row";

    thinking.innerHTML = `
        <div class="avatar-small">AI</div>

        <div class="ai-bubble thinking">
            ● ● ●
        </div>
    `;

    chat.appendChild(thinking);

    chat.scrollTop =
        chat.scrollHeight;

    try {

        const response =
            await fetch("/api/test-ai", {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    message,
                    level: userLevel,
                    history: conversationHistory
                })
            });

        const data =
            await response.json();

        if (thinking) {
            thinking.remove();
        }

        if (!response.ok || !data.success) {

            showError(
                data.error ||
                "AI connection error."
            );

            if (status) {
                status.textContent =
                    "Connection error";
            }

            return;
        }

        const reply =
            String(
                data.reply || ""
            ).trim();

        if (!reply) {

            showError(
                "The AI returned an empty response."
            );

            return;
        }

        addAIMessage(reply);

        conversationHistory.push({
            role: "assistant",
            content: reply
        });

        if (status) {
            status.textContent =
                "Ready to practice";
            status.setAttribute("aria-busy", "false");
        }

        speakAI(reply);

    } catch (error) {

        console.error(
            "Chat error:",
            error
        );

        if (thinking) {
            thinking.remove();
        }

        showError(
            "Could not connect to Hassan.AI."
        );

        if (status) {
            status.textContent =
                "Connection error";
            status.setAttribute("aria-busy", "false");
        }
    } finally {
        if (sendButton) {
            sendButton.disabled = false;
        }

        if (status) {
            status.setAttribute("aria-busy", "false");
        }
    }

    chat.scrollTop =
        chat.scrollHeight;
}


/* =========================================================
   SPEECH RECOGNITION
========================================================= */

function setupSpeechRecognition() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        return;
    }

    recognition =
        new SpeechRecognition();

    recognition.lang =
        "en-US";

    recognition.continuous =
        false;

    recognition.interimResults =
        false;

    recognition.maxAlternatives =
        1;

    recognition.onstart = () => {

        isListening = true;

        updateMicButton();

        const status =
            document.getElementById("chatStatus");

        if (status) {
            status.textContent =
                "🎤 Listening...";
        }
    };

    recognition.onresult =
        event => {

            const text =
                event.results[0][0].transcript;

            const input =
                document.getElementById("chatInput");

            if (input) {
                input.value = text;
            }

            setTimeout(
                sendChatMessage,
                250
            );
        };

    recognition.onerror =
        event => {

            console.error(
                "Speech recognition error:",
                event.error
            );

            isListening = false;

            updateMicButton();

            const status =
                document.getElementById("chatStatus");

            if (status) {

                status.textContent =
                    event.error === "not-allowed"
                        ? "Microphone permission denied"
                        : "Microphone error";
            }
        };

    recognition.onend = () => {

        isListening = false;

        updateMicButton();
    };
}


/* =========================================================
   MICROPHONE
========================================================= */

function toggleMicrophone() {

    if (!recognition) {

        alert(
            "Voice recognition is not available in this browser."
        );

        return;
    }

    if (isListening) {
        recognition.stop();
        return;
    }

    try {
        recognition.start();
    } catch (error) {
        console.error(
            "Microphone start error:",
            error
        );
    }
}


/* =========================================================
   MICROPHONE BUTTON
========================================================= */

function updateMicButton() {

    const button =
        document.getElementById("micButton");

    if (!button) return;

    if (isListening) {

        button.textContent =
            "🔴";

        button.title =
            "Stop listening";

    } else {

        button.textContent =
            "🎤";

        button.title =
            "Speak";
    }

    button.setAttribute(
        "aria-pressed",
        String(isListening)
    );
}


/* =========================================================
   VOICES
========================================================= */

function loadVoices() {

    if (!window.speechSynthesis) return;

    voices =
        speechSynthesis.getVoices();

    speechSynthesis.onvoiceschanged =
        () => {
            voices =
                speechSynthesis.getVoices();
        };
}


function findEnglishVoice() {

    voices =
        speechSynthesis.getVoices();

    const englishVoices =
        voices.filter(voice =>
            voice.lang &&
            voice.lang
                .toLowerCase()
                .startsWith("en")
        );

    if (!englishVoices.length) {
        return null;
    }

    const preferredNames = [
        "Microsoft Jenny",
        "Jenny",
        "Aria",
        "Samantha",
        "Zira",
        "Sonia",
        "Hazel"
    ];

    for (const preferredName of preferredNames) {

        const found =
            englishVoices.find(
                voice =>
                    voice.name
                        .toLowerCase()
                        .includes(
                            preferredName.toLowerCase()
                        )
            );

        if (found) {
            return found;
        }
    }

    return englishVoices[0];
}


function findPortugueseVoice() {

    voices =
        speechSynthesis.getVoices();

    const portugueseVoices =
        voices.filter(voice =>
            voice.lang &&
            voice.lang
                .toLowerCase()
                .startsWith("pt")
        );

    if (!portugueseVoices.length) {
        return null;
    }

    const preferredNames = [
        "Microsoft Francisca",
        "Francisca",
        "Microsoft Maria",
        "Maria",
        "Helena",
        "Luciana",
        "Joana"
    ];

    for (const preferredName of preferredNames) {

        const found =
            portugueseVoices.find(
                voice =>
                    voice.name
                        .toLowerCase()
                        .includes(
                            preferredName.toLowerCase()
                        )
            );

        if (found) {
            return found;
        }
    }

    return portugueseVoices[0];
}


/* =========================================================
   LANGUAGE DETECTION
========================================================= */

function detectLanguage(text) {

    const portuguesePatterns = [

        /\bexplicação\b/i,
        /\bexplicacao\b/i,
        /\bem português\b/i,
        /\bportuguês\b/i,
        /\bportugues\b/i,
        /\bporque\b/i,
        /\busamos\b/i,
        /\busado\b/i,
        /\bcorreto\b/i,
        /\bcorreção\b/i,
        /\bcorrecao\b/i,
        /\bpassado\b/i,
        /\bfuturo\b/i,
        /\bfrase\b/i,
        /\bpalavra\b/i,
        /\bsignifica\b/i,
        /\btradução\b/i,
        /\btraducao\b/i,
        /\bvocê\b/i,
        /\bvoce\b/i,
        /\bnão\b/i,
        /\bnao\b/i,
        /\bpara\b/i
    ];

    return portuguesePatterns.some(
        pattern => pattern.test(text)
    )
        ? "pt"
        : "en";
}


/* =========================================================
   SPLIT SPEECH BY LANGUAGE
========================================================= */

function splitTextByLanguage(text) {

    const lines =
        String(text)
            .replace(/[*#_`]/g, "")
            .replace(
                /🤖|😊|🎯|✨|👋|🇵🇹|💬|🎤|⚠️|🎓/g,
                ""
            )
            .split(/\n+/)
            .map(line => line.trim())
            .filter(line => line.length > 0);

    return lines.map(line => ({
        text: line,
        language: detectLanguage(line)
    }));
}


/* =========================================================
   SPEAK PART
========================================================= */

function speakPart(part, onEnd) {

    const speech =
        new SpeechSynthesisUtterance(
            part.text
        );

    let selectedVoice = null;

    if (part.language === "pt") {

        selectedVoice =
            findPortugueseVoice();

        speech.lang =
            "pt-PT";

        if (!selectedVoice) {
            speech.lang =
                "pt-BR";
        }

        speech.rate =
            0.88;

    } else {

        selectedVoice =
            findEnglishVoice();

        speech.lang =
            "en-US";

        speech.rate =
            0.82;
    }

    if (selectedVoice) {

        speech.voice =
            selectedVoice;

        speech.lang =
            selectedVoice.lang;
    }

    speech.pitch =
        1.03;

    speech.volume =
        1;

    speech.onend =
        onEnd;

    speech.onerror =
        onEnd;

    speechSynthesis.speak(
        speech
    );
}


/* =========================================================
   SPEAK AI
========================================================= */

function speakAI(text) {

    if (!window.speechSynthesis) {
        return;
    }

    speechSynthesis.cancel();

    const parts =
        splitTextByLanguage(text);

    if (!parts.length) {
        return;
    }

    let currentPart = 0;

    function speakNext() {

        if (
            currentPart >=
            parts.length
        ) {
            return;
        }

        const part =
            parts[currentPart];

        currentPart++;

        speakPart(
            part,
            speakNext
        );
    }

    speakNext();
}


/* =========================================================
   TRANSLATION
========================================================= */

async function translateText(text, element) {

    if (!text || !text.trim()) {
        return;
    }

    removeTranslationPopup();

    if (element) {
        element.classList.add("translating");
    }

    try {

        const response =
            await fetch("/api/translate", {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    text
                })
            });

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.error ||
                "Translation failed."
            );
        }

        const translation =
            String(
                data.translation || ""
            ).trim();

        if (!translation) {
            throw new Error(
                "Empty translation."
            );
        }

        showTranslation(
            text,
            translation,
            element
        );

    } catch (error) {

        console.error(
            "Translation error:",
            error
        );

        showTranslation(
            text,
            "Translation unavailable.",
            element
        );

    } finally {

        if (element) {
            element.classList.remove(
                "translating"
            );
        }
    }
}


/* =========================================================
   TRANSLATION POPUP
========================================================= */

function showTranslation(
    original,
    translation,
    element
) {

    removeTranslationPopup();

    const popup =
        document.createElement("div");

    popup.id =
        "translationPopup";

    popup.className =
        "translation-popup";

    popup.setAttribute("role", "dialog");
    popup.setAttribute("aria-live", "polite");
    popup.setAttribute("aria-label", "Tradução");

    popup.innerHTML = `

        <div class="translation-original">
            ${escapeHTML(original)}
        </div>

        <div class="translation-arrow">
            ↓
        </div>

        <div class="translation-result">
            ${escapeHTML(translation)}
        </div>

        <button
            class="translation-close"
            type="button"
            aria-label="Close"
        >
            ×
        </button>
    `;

    document.body.appendChild(popup);

    const rect =
        element
            ? element.getBoundingClientRect()
            : null;

    const popupWidth =
        Math.min(
            300,
            window.innerWidth - 30
        );

    let left =
        rect
            ? rect.left
            : (window.innerWidth - popupWidth) / 2;

    let top =
        rect
            ? rect.bottom + 10
            : 100;

    if (
        left + popupWidth >
        window.innerWidth - 15
    ) {
        left =
            window.innerWidth -
            popupWidth -
            15;
    }

    if (left < 15) {
        left = 15;
    }

    if (
        top + 160 >
        window.innerHeight
    ) {

        if (rect) {
            top =
                rect.top - 170;
        }
    }

    if (top < 15) {
        top = 15;
    }

    popup.style.position =
        "fixed";

    popup.style.width =
        `${popupWidth}px`;

    popup.style.maxWidth =
        "calc(100vw - 30px)";

    popup.style.top =
        `${top}px`;

    popup.style.left =
        `${left}px`;

    const closeButton =
        popup.querySelector(
            ".translation-close"
        );

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            event => {

                event.preventDefault();
                event.stopPropagation();

                removeTranslationPopup();
            }
        );
    }
}


function removeTranslationPopup() {

    const popup =
        document.getElementById(
            "translationPopup"
        );

    if (popup) {
        popup.remove();
    }
}


/* =========================================================
   CLICKABLE WORDS
========================================================= */

function createClickableWord(text) {

    const word =
        document.createElement("span");

    word.className =
        "clickable-word";

    word.textContent =
        text;

    word.title =
        "Click to translate";

    word.setAttribute("role", "button");
    word.setAttribute("tabindex", "0");

    word.addEventListener(
        "click",
        event => {

            event.preventDefault();
            event.stopPropagation();

            translateText(
                text,
                word
            );
        }
    );

    word.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            translateText(text, word);
        }
    });

    return word;
}


/* =========================================================
   FORMAT MESSAGE
========================================================= */

function formatMessage(message) {

    const container =
        document.createElement("span");

    const lines =
        String(message)
            .split("\n");

    lines.forEach(
        (line, lineIndex) => {

            const parts =
                line.split(/(\s+)/);

            parts.forEach(part => {

                if (!part) return;

                if (/^\s+$/.test(part)) {

                    container.appendChild(
                        document.createTextNode(part)
                    );

                    return;
                }

                const word =
                    createClickableWord(part);

                container.appendChild(word);
            });

            if (
                lineIndex <
                lines.length - 1
            ) {

                container.appendChild(
                    document.createElement("br")
                );
            }
        }
    );

    return container;
}


/* =========================================================
   ERROR
========================================================= */

function showError(message) {

    const chat =
        document.getElementById("chat");

    if (!chat) return;

    const error =
        document.createElement("div");

    error.className =
        "error-message";

    error.textContent =
        `⚠️ ${message}`;

    chat.appendChild(error);

    chat.scrollTop =
        chat.scrollHeight;
}


/* =========================================================
   SECURITY
========================================================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        String(text);

    return div.innerHTML;
}


/* =========================================================
   CLOSE TRANSLATION
========================================================= */

document.addEventListener(
    "click",
    event => {

        const popup =
            document.getElementById(
                "translationPopup"
            );

        if (
            popup &&
            !popup.contains(event.target) &&
            !event.target.closest(".clickable-word")
        ) {
            removeTranslationPopup();
        }
    }
);


/* =========================================================
   STOP SPEECH
========================================================= */

window.addEventListener(
    "beforeunload",
    () => {

        if (window.speechSynthesis) {
            speechSynthesis.cancel();
        }
    }
);