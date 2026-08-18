"use strict";

/*
 * ==========================================
 * ONEPASTE
 * ==========================================
 *
 * Backend: Supabase
 * Hosting: GitHub Pages
 *
 * Clipboard expiry: 30 minutes
 * Maximum text: 50,000 characters
 *
 * ==========================================
 */


/* ==========================================
   SUPABASE CONFIGURATION
   ========================================== */

const SUPABASE_URL =
    "https://pjhkxsjyiqkrjufceemi.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_9cXi7t_5H_I2PlYP1jROLg_0R4gpCu6";


const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* ==========================================
   SETTINGS
   ========================================== */

const MAX_LENGTH = 50000;

/*
 * 30 minutes
 */
const EXPIRY_MINUTES = 60;

const MAX_CODE_ATTEMPTS = 20;


/* ==========================================
   ELEMENTS
   ========================================== */

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

    element.textContent =
        text;

    element.className =
        `message ${type}`;

}


function clearMessage(element) {

    element.textContent =
        "";

    element.className =
        "message";

}


/* ==========================================
   BUTTON LOADING STATE
   ========================================== */

function setButtonLoading(
    button,
    loadingText
) {

    button.disabled = true;

    button.dataset.originalText =
        button.textContent;

    button.textContent =
        loadingText;

}


function resetButton(button) {

    button.disabled = false;

    if (button.dataset.originalText) {

        button.textContent =
            button.dataset.originalText;

        delete button.dataset.originalText;

    }

}


/* ==========================================
   GENERATE RANDOM 4 DIGIT CODE
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
   CREATE EXPIRY TIME
   ========================================== */

function getExpiryTime() {

    return new Date(
        Date.now() +
        EXPIRY_MINUTES * 60 * 1000
    ).toISOString();

}


/* ==========================================
   SEND TEXT
   ========================================== */

sendButton.addEventListener(
    "click",
    async () => {

        clearMessage(sendMessage);

        /*
         * Hide previous result
         */
        sentBox.style.display =
            "none";


        const text =
            sendText.value;


        /* --------------------------------------
           EMPTY TEXT
           -------------------------------------- */

        if (!text.trim()) {

            showMessage(
                sendMessage,
                "Please write something first.",
                "error"
            );

            sendText.focus();

            return;

        }


        /* --------------------------------------
           MAXIMUM LENGTH
           -------------------------------------- */

        if (
            text.length >
            MAX_LENGTH
        ) {

            showMessage(
                sendMessage,
                "Text is too long.",
                "error"
            );

            return;

        }


        setButtonLoading(
            sendButton,
            "Sending..."
        );


        try {

            let sent = false;

            let successfulCode = null;


            /*
             * ----------------------------------
             * TRY MULTIPLE CODES
             * ----------------------------------
             *
             * This protects against two users
             * getting the same 4 digit code.
             */

            for (
                let attempt = 0;
                attempt < MAX_CODE_ATTEMPTS;
                attempt++
            ) {

                const code =
                    generateCode();


                const expiresAt =
                    getExpiryTime();


                const {
                    error
                } =
                    await supabaseClient
                        .from("clipboards")
                        .insert({
                            code: code,
                            content: text,
                            expires_at: expiresAt
                        });


                /*
                 * Successful insert
                 */

                if (!error) {

                    sent = true;

                    successfulCode =
                        code;

                    break;

                }


                /*
                 * Duplicate code
                 *
                 * PostgreSQL unique violation:
                 * 23505
                 *
                 * Try another code.
                 */

                if (
                    error.code === "23505"
                ) {

                    continue;

                }


                /*
                 * Other database error
                 */

                console.error(
                    "Supabase send error:",
                    error
                );

                showMessage(
                    sendMessage,
                    "Unable to send text. Please try again.",
                    "error"
                );

                resetButton(sendButton);

                return;

            }


            /*
             * ----------------------------------
             * NO AVAILABLE CODE
             * ----------------------------------
             */

            if (!sent) {

                showMessage(
                    sendMessage,
                    "Unable to generate a code. Please try again.",
                    "error"
                );

                resetButton(sendButton);

                return;

            }


            /*
             * ----------------------------------
             * SUCCESS
             * ----------------------------------
             */

            generatedCode.textContent =
                successfulCode;


            sentBox.style.display =
                "block";


            showMessage(
                sendMessage,
                "Text sent successfully.",
                "success"
            );


        } catch (error) {

            console.error(
                "Send error:",
                error
            );

            showMessage(
                sendMessage,
                "Unable to connect to server. Please try again.",
                "error"
            );

        } finally {

            resetButton(sendButton);

        }

    }
);


/* ==========================================
   CODE INPUT
   ========================================== */

receiveCode.addEventListener(
    "input",
    () => {

        /*
         * Only numbers
         */

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
    async () => {

        clearMessage(
            receiveMessage
        );


        receivedBox.style.display =
            "none";


        const code =
            receiveCode.value.trim();


        /* --------------------------------------
           INVALID LENGTH
           -------------------------------------- */

        if (!/^\d{4}$/.test(code)) {

            showMessage(
                receiveMessage,
                "Please write 4 Digit code",
                "error"
            );

            receiveCode.focus();

            return;

        }


        setButtonLoading(
            receiveButton,
            "Getting Text..."
        );


        try {

            /*
             * ----------------------------------
             * FIND ACTIVE CODE
             * ----------------------------------
             *
             * The expires_at condition means
             * expired clipboard entries cannot
             * be retrieved.
             */

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("clipboards")
                    .select("content")
                    .eq("code", code)
                    .gt(
                        "expires_at",
                        new Date().toISOString()
                    )
                    .maybeSingle();


            /*
             * Database error
             */

            if (error) {

                console.error(
                    "Supabase receive error:",
                    error
                );

                showMessage(
                    receiveMessage,
                    "Unable to get text. Please try again.",
                    "error"
                );

                return;

            }


            /*
             * Code doesn't exist
             * or has expired
             */

            if (!data) {

                showMessage(
                    receiveMessage,
                    "Code isn't valid",
                    "error"
                );

                receiveCode.focus();

                return;

            }


            /*
             * ----------------------------------
             * SUCCESS
             * ----------------------------------
             */

            receivedText.value =
                data.content;


            receivedBox.style.display =
                "block";


            showMessage(
                receiveMessage,
                "Text received!",
                "success"
            );


        } catch (error) {

            console.error(
                "Receive error:",
                error
            );

            showMessage(
                receiveMessage,
                "Unable to connect to server. Please try again.",
                "error"
            );

        } finally {

            resetButton(
                receiveButton
            );

        }

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

            /*
             * Fallback for browsers where
             * Clipboard API isn't available.
             */

            receivedText.focus();

            receivedText.select();

            document.execCommand(
                "copy"
            );

        }


        const originalText =
            copyButton.textContent;


        copyButton.textContent =
            "Copied!";


        setTimeout(
            () => {

                copyButton.textContent =
                    originalText;

            },
            1500
        );

    }
);
