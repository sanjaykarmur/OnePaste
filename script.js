"use strict";


/*
 * ==========================================
 * ONEPASTE
 * ==========================================
 *
 * Frontend demo.
 *
 * Current storage:
 * localStorage
 *
 * This allows testing the complete UI
 * on the same browser.
 *
 * For real device to device sharing,
 * localStorage will later be replaced
 * with Supabase.
 *
 * ==========================================
 */


const MAX_LENGTH = 50000;


/* ELEMENTS */

const sendText =
    document.getElementById("sendText");

const characterCount =
    document.getElementById("characterCount");

const sendButton =
    document.getElementById("sendButton");

const sendMessage =
    document.getElementById("sendMessage");

const sentBox =
    document.getElementById("sentBox");

const generatedCode =
    document.getElementById("generatedCode");


const receiveCode =
    document.getElementById("receiveCode");

const receiveButton =
    document.getElementById("receiveButton");

const receiveMessage =
    document.getElementById("receiveMessage");

const receivedBox =
    document.getElementById("receivedBox");

const receivedText =
    document.getElementById("receivedText");

const copyButton =
    document.getElementById("copyButton");


/* ==========================================
   CHARACTER COUNT
   ========================================== */

sendText.addEventListener(
    "input",
    () => {

        const count =
            sendText.value.length;

        characterCount.textContent =
            `${count.toLocaleString()} / ${MAX_LENGTH.toLocaleString()} characters`;

    }
);


/* ==========================================
   MESSAGE FUNCTIONS
   ========================================== */

function showMessage(
    element,
    text,
    type
) {

    element.textContent = text;

    element.className =
        `message ${type}`;

}


function clearMessage(element) {

    element.textContent = "";

    element.className =
        "message";

}


/* ==========================================
   GENERATE 4 DIGIT CODE
   ========================================== */

function generateCode() {

    return String(
        Math.floor(
            1000 +
            Math.random() * 9000
        )
    );

}


/* ==========================================
   SEND TEXT
   ========================================== */

sendButton.addEventListener(
    "click",
    () => {

        clearMessage(sendMessage);


        const text =
            sendText.value;


        /* EMPTY */

        if (!text.trim()) {

            showMessage(
                sendMessage,
                "Please write something first.",
                "error"
            );

            sendText.focus();

            return;

        }


        /* MAXIMUM LENGTH */

        if (text.length > MAX_LENGTH) {

            showMessage(
                sendMessage,
                "Text is too long.",
                "error"
            );

            return;

        }


        /*
         * TEMPORARY LOCAL STORAGE
         */

        const code =
            generateCode();


        localStorage.setItem(
            `clipboard_${code}`,
            text
        );


        /* SHOW CODE */

        generatedCode.textContent =
            code;

        sentBox.style.display =
            "block";


        showMessage(
            sendMessage,
            "Text sent successfully.",
            "success"
        );

    }
);


/* ==========================================
   CODE INPUT
   ========================================== */

receiveCode.addEventListener(
    "input",
    () => {

        receiveCode.value =
            receiveCode.value
                .replace(/\D/g, "")
                .slice(0, 4);


        clearMessage(
            receiveMessage
        );

    }
);


/* ==========================================
   RECEIVE TEXT
   ========================================== */

receiveButton.addEventListener(
    "click",
    () => {

        clearMessage(
            receiveMessage
        );

        receivedBox.style.display =
            "none";


        const code =
            receiveCode.value.trim();


        /* NOT 4 DIGITS */

        if (!/^\d{4}$/.test(code)) {

            showMessage(
                receiveMessage,
                "Please write 4 Digit code",
                "error"
            );

            receiveCode.focus();

            return;

        }


        /*
         * TEMPORARY LOCAL STORAGE
         */

        const text =
            localStorage.getItem(
                `clipboard_${code}`
            );


        /* INVALID CODE */

        if (text === null) {

            showMessage(
                receiveMessage,
                "Code isn't valid",
                "error"
            );

            receiveCode.focus();

            return;

        }


        /* SUCCESS */

        receivedText.value =
            text;

        receivedBox.style.display =
            "block";


        showMessage(
            receiveMessage,
            "Text received!",
            "success"
        );

    }
);


/* ==========================================
   COPY TEXT
   ========================================== */

copyButton.addEventListener(
    "click",
    async () => {

        const text =
            receivedText.value;


        if (!text) {
            return;
        }


        try {

            await navigator.clipboard.writeText(
                text
            );

        } catch (error) {

            receivedText.focus();

            receivedText.select();

            document.execCommand(
                "copy"
            );

        }


        copyButton.textContent =
            "Copied!";


        setTimeout(
            () => {

                copyButton.textContent =
                    "Copy Text";

            },
            1500
        );

    }
);

