/* =========================================================
   HASSAN.AI — ENGLISH TEACHER
   Main application script
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const startTestButton =
    document.getElementById("startTestButton");

const levelTest =
    document.getElementById("levelTest");

const testQuestions =
    document.getElementById("testQuestions");

const questionText =
    document.getElementById("questionText");

const questionNumber =
    document.getElementById("questionNumber");

const progressFill =
    document.getElementById("progressFill");

const answerInput =
    document.getElementById("answerInput");

const submitAnswer =
    document.getElementById("submitAnswer");


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
   VOICE VARIABLES
========================================================= */

let recognition = null;

let isListening = false;

let voices = [];


/* =========================================================
   START TEST
========================================================= */

if (startTestButton) {

    startTestButton.addEventListener(
        "click",
        function () {

            levelTest.classList.add("hidden");

            testQuestions.classList.remove("hidden");

            currentQuestion = 0;

            answers = [];

            showQuestion();

        }
    );

}


/* =========================================================
   SHOW QUESTION
========================================================= */

function showQuestion() {

    if (!questionText) {
        return;
    }

    questionText.textContent =
        questions[currentQuestion];


    if (questionNumber) {

        questionNumber.textContent =
            "Question " +
            (currentQuestion + 1) +
            " of " +
            questions.length;

    }


    if (progressFill) {

        const percentage =
            ((currentQuestion + 1) /
                questions.length) *
            100;

        progressFill.style.width =
            percentage + "%";

    }


    if (answerInput) {

        answerInput.value = "";

        setTimeout(function () {

            answerInput.focus();

        }, 100);

    }

}


/* =========================================================
   SUBMIT ANSWER
========================================================= */

if (submitAnswer) {

    submitAnswer.addEventListener(
        "click",
        submitTestAnswer
    );

}


function submitTestAnswer() {

    if (!answerInput) {
        return;
    }

    const answer =
        answerInput.value.trim();


    if (!answer) {

        alert(
            "Please answer the question."
        );

        answerInput.focus();

        return;
    }


    answers.push(answer);

    currentQuestion++;


    if (
        currentQuestion <
        questions.length
    ) {

        showQuestion();

    } else {

        finishTest();

    }

}


/* =========================================================
   ENTER KEY
========================================================= */

if (answerInput) {

    answerInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                submitTestAnswer();

            }

        }
    );

}


/* =========================================================
   FINISH LEVEL TEST
========================================================= */

async function finishTest() {

    testQuestions.innerHTML = `

        <div class="question-card">

            <div class="result-icon">
                🤖
            </div>

            <h2>
                Analyzing your English...
            </h2>

            <p class="question-subtitle">

                Hassan.AI is analyzing your
                grammar, vocabulary and
                communication.

            </p>

        </div>

    `;


    try {

        const response =
            await fetch(
                "/api/level-test",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        answers: answers
                    })
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.error ||
                "Level test failed."
            );

        }


        userLevel =
            data.result?.level ||
            "A1";


        showLevelResult(
            data.result || {}
        );


    } catch (error) {

        console.error(
            "Level test error:",
            error
        );


        testQuestions.innerHTML = `

            <div class="question-card">

                <div class="result-icon">
                    ⚠️
                </div>

                <h2>
                    Could not analyze your level
                </h2>

                <p class="question-subtitle">

                    ${escapeHTML(
                        error.message ||
                        "Something went wrong."
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
            document.getElementById(
                "retryTest"
            );


        if (retryButton) {

            retryButton.addEventListener(
                "click",
                function () {

                    location.reload();

                }
            );

        }

    }

}


/* =========================================================
   LEVEL RESULT
========================================================= */

function showLevelResult(result) {

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
        "Keep practicing and continue improving your English.";


    userLevel = level;


    testQuestions.innerHTML = `

        <div class="question-card">

            <div class="result-icon">
                🎓
            </div>


            <div class="question-label">
                YOUR ENGLISH LEVEL
            </div>


            <h2>
                ${escapeHTML(level)}
            </h2>


            <div id="levelResult">
                ${escapeHTML(score)}%
            </div>


            <p class="question-subtitle">

                ${escapeHTML(
                    recommendation
                )}

            </p>


            <div
                style="
                    display:grid;
                    gap:14px;
                    margin:25px 0;
                    text-align:left;
                "
            >

                <div
                    style="
                        padding:18px;
                        border-radius:17px;
                        background:#edf6ff;
                        border:1px solid #d7eaff;
                    "
                >

                    <strong
                        style="
                            color:#07111f;
                        "
                    >
                        💪 Strengths
                    </strong>


                    <div
                        style="
                            margin-top:9px;
                            color:#667085;
                            font-size:12px;
                            line-height:1.7;
                        "
                    >

                        ${
                            strengths.length

                            ? strengths
                                .map(
                                    item =>
                                        "• " +
                                        escapeHTML(item)
                                )
                                .join("<br>")

                            : "Good effort!"
                        }

                    </div>

                </div>


                <div
                    style="
                        padding:18px;
                        border-radius:17px;
                        background:#f7f9fc;
                        border:1px solid #e5eaf0;
                    "
                >

                    <strong
                        style="
                            color:#07111f;
                        "
                    >
                        🎯 Areas to improve
                    </strong>


                    <div
                        style="
                            margin-top:9px;
                            color:#667085;
                            font-size:12px;
                            line-height:1.7;
                        "
                    >

                        ${
                            weaknesses.length

                            ? weaknesses
                                .map(
                                    item =>
                                        "• " +
                                        escapeHTML(item)
                                )
                                .join("<br>")

                            : "Keep practicing!"
                        }

                    </div>

                </div>

            </div>


            <button
                id="startLearning"
                class="primary-button"
                type="button"
            >
                Start Learning →
            </button>

        </div>

    `;


    const startLearningButton =
        document.getElementById(
            "startLearning"
        );


    if (startLearningButton) {

        startLearningButton.addEventListener(
            "click",
            startLearning
        );

    }

}


/* =========================================================
   START LEARNING
========================================================= */

function startLearning() {

    testQuestions.innerHTML = `

        <div class="question-card">

            <div class="result-icon">
                🤖
            </div>


            <div class="question-label">
                HASSAN.AI
            </div>


            <h2>
                Your teacher is ready!
            </h2>


            <p class="question-subtitle">

                Your English level is

                <strong>
                    ${escapeHTML(userLevel)}
                </strong>.

                <br><br>

                Hassan.AI will help you practice
                English, correct important mistakes
                and explain them in Portuguese.

            </p>


            <button
                id="startConversation"
                class="primary-button"
                type="button"
            >
                Start Conversation →
            </button>

        </div>

    `;


    const startConversationButton =
        document.getElementById(
            "startConversation"
        );


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

    conversationHistory = [];


    testQuestions.innerHTML = `

        <div class="chat-app">


            <div class="chat-header">

                <div class="teacher-avatar">
                    🎓
                </div>


                <div>

                    <strong>
                        Hassan.AI Teacher
                    </strong>

                    <span>
                        ● Online · Level
                        ${escapeHTML(userLevel)}
                    </span>

                </div>

            </div>


            <div
                id="chat"
                class="chat-messages"
            >
            </div>


            <div
                id="chatStatus"
                class="chat-status"
            >
                Ready to practice
            </div>


            <div class="chat-input-area">


                <button
                    id="micButton"
                    class="mic-button"
                    type="button"
                    title="Speak"
                >
                    🎤
                </button>


                <input
                    id="chatInput"
                    type="text"
                    placeholder="Type or speak in English..."
                    autocomplete="off"
                >


                <button
                    id="chatSend"
                    class="send-button"
                    type="button"
                    title="Send"
                >
                    ➤
                </button>


            </div>

        </div>

    `;


    const firstMessage =
        "Hello! 👋 I'm your Hassan.AI English teacher. How are you today?";


    addAIMessage(
        firstMessage
    );


    conversationHistory.push({

        role: "assistant",

        content: firstMessage

    });


    const chatSend =
        document.getElementById(
            "chatSend"
        );


    const chatInput =
        document.getElementById(
            "chatInput"
        );


    const micButton =
        document.getElementById(
            "micButton"
        );


    if (chatSend) {

        chatSend.addEventListener(
            "click",
            sendChatMessage
        );

    }


    if (chatInput) {

        chatInput.addEventListener(
            "keydown",
            function (event) {

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


    setTimeout(
        function () {

            speakAI(firstMessage);

        },
        500
    );

}


/* =========================================================
   ADD AI MESSAGE
========================================================= */

function addAIMessage(message) {

    const chat =
        document.getElementById(
            "chat"
        );


    if (!chat) {
        return;
    }


    const row =
        document.createElement(
            "div"
        );


    row.className =
        "message-row ai-row";


    const avatar =
        document.createElement(
            "div"
        );


    avatar.className =
        "avatar-small";


    avatar.textContent =
        "🎓";


    const bubble =
        document.createElement(
            "div"
        );


    bubble.className =
        "ai-bubble";


    bubble.innerHTML =
        formatMessage(message);


    row.appendChild(
        avatar
    );


    row.appendChild(
        bubble
    );


    chat.appendChild(
        row
    );


    chat.scrollTop =
        chat.scrollHeight;

}


/* =========================================================
   ADD USER MESSAGE
========================================================= */

function addUserMessage(message) {

    const chat =
        document.getElementById(
            "chat"
        );


    if (!chat) {
        return;
    }


    const row =
        document.createElement(
            "div"
        );


    row.className =
        "message-row user-row";


    const bubble =
        document.createElement(
            "div"
        );


    bubble.className =
        "user-bubble";


    bubble.textContent =
        message;


    row.appendChild(
        bubble
    );


    chat.appendChild(
        row
    );


    chat.scrollTop =
        chat.scrollHeight;

}


/* =========================================================
   SEND CHAT MESSAGE
========================================================= */

async function sendChatMessage() {

    const input =
        document.getElementById(
            "chatInput"
        );


    const chat =
        document.getElementById(
            "chat"
        );


    const status =
        document.getElementById(
            "chatStatus"
        );


    if (!input || !chat) {
        return;
    }


    const message =
        input.value.trim();


    if (!message) {
        return;
    }


    addUserMessage(
        message
    );


    input.value = "";


    conversationHistory.push({

        role: "user",

        content: message

    });


    if (status) {

        status.textContent =
            "Hassan.AI is thinking...";

    }


    const thinking =
        document.createElement(
            "div"
        );


    thinking.id =
        "thinking";


    thinking.className =
        "message-row ai-row";


    thinking.innerHTML = `

        <div class="avatar-small">
            🎓
        </div>

        <div class="ai-bubble thinking">
            ● ● ●
        </div>

    `;


    chat.appendChild(
        thinking
    );


    chat.scrollTop =
        chat.scrollHeight;


    try {

        const response =
            await fetch(
                "/api/test-ai",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        message: message,

                        level: userLevel,

                        history:
                            conversationHistory

                    })
                }
            );


        const data =
            await response.json();


        if (thinking) {
            thinking.remove();
        }


        if (
            !response.ok ||
            !data.success
        ) {

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


        addAIMessage(
            reply
        );


        conversationHistory.push({

            role: "assistant",

            content: reply

        });


        if (status) {

            status.textContent =
                "Ready to practice";

        }


        speakAI(
            reply
        );


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

        console.warn(
            "Speech recognition is not supported."
        );

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


    recognition.onstart =
        function () {

            isListening = true;

            updateMicButton();


            const status =
                document.getElementById(
                    "chatStatus"
                );


            if (status) {

                status.textContent =
                    "🎤 Listening...";

            }

        };


    recognition.onresult =
        function (event) {

            const text =
                event
                    .results[0][0]
                    .transcript;


            const input =
                document.getElementById(
                    "chatInput"
                );


            if (input) {

                input.value =
                    text;

            }


            setTimeout(
                sendChatMessage,
                250
            );

        };


    recognition.onerror =
        function (event) {

            console.error(
                "Speech recognition error:",
                event.error
            );


            isListening = false;

            updateMicButton();


            const status =
                document.getElementById(
                    "chatStatus"
                );


            if (status) {

                if (
                    event.error ===
                    "not-allowed"
                ) {

                    status.textContent =
                        "Microphone permission denied";

                } else {

                    status.textContent =
                        "Microphone error";

                }

            }

        };


    recognition.onend =
        function () {

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
   MICROPHONE BUTTON UI
========================================================= */

function updateMicButton() {

    const button =
        document.getElementById(
            "micButton"
        );


    if (!button) {
        return;
    }


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

}


/* =========================================================
   SPEECH SYNTHESIS
========================================================= */

function loadVoices() {

    if (!window.speechSynthesis) {
        return;
    }


    voices =
        speechSynthesis.getVoices();


    speechSynthesis.onvoiceschanged =
        function () {

            voices =
                speechSynthesis.getVoices();

        };

}


/* =========================================================
   FIND ENGLISH VOICE
========================================================= */

function findEnglishVoice() {

    voices =
        speechSynthesis.getVoices();


    const englishVoices =
        voices.filter(
            function (voice) {

                return (
                    voice.lang &&
                    voice.lang
                        .toLowerCase()
                        .startsWith("en")
                );

            }
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


    for (
        const preferredName
        of preferredNames
    ) {

        const found =
            englishVoices.find(
                function (voice) {

                    return voice.name
                        .toLowerCase()
                        .includes(
                            preferredName
                                .toLowerCase()
                        );

                }
            );


        if (found) {

            return found;

        }

    }


    return englishVoices[0];

}


/* =========================================================
   FIND PORTUGUESE VOICE
========================================================= */

function findPortugueseVoice() {

    voices =
        speechSynthesis.getVoices();


    const portugueseVoices =
        voices.filter(
            function (voice) {

                return (
                    voice.lang &&
                    voice.lang
                        .toLowerCase()
                        .startsWith("pt")
                );

            }
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


    for (
        const preferredName
        of preferredNames
    ) {

        const found =
            portugueseVoices.find(
                function (voice) {

                    return voice.name
                        .toLowerCase()
                        .includes(
                            preferredName
                                .toLowerCase()
                        );

                }
            );


        if (found) {

            return found;

        }

    }


    return portugueseVoices[0];

}


/* =========================================================
   DETECT LANGUAGE
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

        /\bpresent\b/i,

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


    let score = 0;


    portuguesePatterns.forEach(
        function (pattern) {

            if (
                pattern.test(text)
            ) {

                score++;

            }

        }
    );


    return score >= 1
        ? "pt"
        : "en";

}


/* =========================================================
   SPLIT TEXT BY LANGUAGE
========================================================= */

function splitTextByLanguage(text) {

    const lines =
        String(text)

            .replace(
                /[*#_`]/g,
                ""
            )

            .replace(
                /🤖|😊|🎯|✨|👋|🇵🇹|💬|🎤|⚠️|🎓/g,
                ""
            )

            .split(/\n+/)

            .map(
                line =>
                    line.trim()
            )

            .filter(
                line =>
                    line.length > 0
            );


    return lines.map(
        function (line) {

            return {

                text: line,

                language:
                    detectLanguage(
                        line
                    )

            };

        }
    );

}


/* =========================================================
   SPEAK PART
========================================================= */

function speakPart(
    part,
    onEnd
) {

    const speech =
        new SpeechSynthesisUtterance(
            part.text
        );


    let selectedVoice = null;


    if (
        part.language === "pt"
    ) {

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
        splitTextByLanguage(
            text
        );


    if (!parts.length) {
        return;
    }


    let currentPart =
        0;


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

async function translateText(
    text,
    element
) {

    if (
        !text ||
        !text.trim()
    ) {

        return;

    }


    removeTranslationPopup();


    if (element) {

        element.classList.add(
            "translating"
        );

    }


    try {

        const response =
            await fetch(
                "/api/translate",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        text: text
                    })
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.error ||
                "Translation failed."
            );

        }


        const translation =
            String(
                data.translation ||
                ""
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
        document.createElement(
            "div"
        );


    popup.id =
        "translationPopup";


    popup.className =
        "translation-popup";


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


    document.body.appendChild(
        popup
    );


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
            : (window.innerWidth -
                popupWidth) / 2;


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
        popupWidth + "px";


    popup.style.maxWidth =
        "calc(100vw - 30px)";


    popup.style.top =
        top + "px";


    popup.style.left =
        left + "px";


    const closeButton =
        popup.querySelector(
            ".translation-close"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();

                removeTranslationPopup();

            }
        );

    }

}


/* =========================================================
   REMOVE TRANSLATION POPUP
========================================================= */

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
   CLICKABLE WORD
========================================================= */

function createClickableWord(
    text
) {

    const word =
        document.createElement(
            "span"
        );


    word.className =
        "clickable-word";


    word.textContent =
        text;


    word.title =
        "Click to translate";


    word.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();


            translateText(
                text,
                word
            );

        }
    );


    return word;

}


/* =========================================================
   FORMAT AI MESSAGE
========================================================= */

function formatMessage(
    message
) {

    const container =
        document.createElement(
            "span"
        );


    const lines =
        String(message)
            .split("\n");


    lines.forEach(
        function (
            line,
            lineIndex
        ) {

            const parts =
                line.split(
                    /(\s+)/
                );


            parts.forEach(
                function (part) {

                    if (!part) {
                        return;
                    }


                    if (
                        /^\s+$/.test(part)
                    ) {

                        container.appendChild(
                            document.createTextNode(
                                part
                            )
                        );

                        return;

                    }


                    const word =
                        createClickableWord(
                            part
                        );


                    container.appendChild(
                        word
                    );

                }
            );


            if (
                lineIndex <
                lines.length - 1
            ) {

                container.appendChild(
                    document.createElement(
                        "br"
                    )
                );

            }

        }
    );


    return container.innerHTML;

}


/* =========================================================
   ERROR
========================================================= */

function showError(
    message
) {

    const chat =
        document.getElementById(
            "chat"
        );


    if (!chat) {
        return;
    }


    const error =
        document.createElement(
            "div"
        );


    error.className =
        "error-message";


    error.textContent =
        "⚠️ " +
        message;


    chat.appendChild(
        error
    );


    chat.scrollTop =
        chat.scrollHeight;

}


/* =========================================================
   SECURITY
========================================================= */

function escapeHTML(
    text
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(text);


    return div.innerHTML;

}


/* =========================================================
   CLOSE TRANSLATION WHEN CLICKING OUTSIDE
========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const popup =
            document.getElementById(
                "translationPopup"
            );


        if (
            popup &&
            !popup.contains(
                event.target
            ) &&
            !event.target.closest(
                ".clickable-word"
            )
        ) {

            removeTranslationPopup();

        }

    }
);


/* =========================================================
   STOP SPEECH WHEN LEAVING PAGE
========================================================= */

window.addEventListener(
    "beforeunload",
    function () {

        if (
            window.speechSynthesis
        ) {

            speechSynthesis.cancel();

        }

    }
);