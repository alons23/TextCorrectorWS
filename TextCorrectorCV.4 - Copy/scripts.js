document.addEventListener("DOMContentLoaded", () => {
    const inputText = document.getElementById("inputText");
    const sendButton = document.getElementById("sendButton");
    const outputText = document.getElementById("outputText");
    const correctionLevelSpinner = document.getElementById("correctionLevelSpinner");
    const styleText = document.getElementById("styleText");
    const progressBar = document.getElementById("progressBar");
    const copyButton = document.getElementById("copyButton");
    const pasteButton = document.getElementById("pasteButton");
    const recordButton = document.getElementById("recordButton");
    const playButton = document.getElementById("playButton");
    const personalDesignButton = document.getElementById("personalDesignButton");
    const historyButton = document.getElementById("historyButton");
    const modal = document.getElementById("personalDesignModal");
    const historyModal = document.getElementById("historyModal");
    const span = document.getElementsByClassName("close")[0];
    const closeHistory = document.getElementsByClassName("close-history")[0];
    const backgroundColorInput = document.getElementById("backgroundColor");
    const textColorInput = document.getElementById("textColor");
    const layoutSelect = document.getElementById("layoutSelect");
    const fontSizeInput = document.getElementById("fontSize");
    const fontFamilySelect = document.getElementById("fontFamily");
    const historyList = document.getElementById("historyList");

    let corrections = {};
    let revisionHistory = [];

    const sendTextToServer = async (text, style) => {
        progressBar.style.display = "block";

        try {
            const response = await fetch("https://my-textcorrector-server-app-0459ab39b45e.herokuapp.com/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text, style })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            progressBar.style.display = "none";

            const responseText = data.choices[0].message.content;

            corrections = JSON.parse(responseText);
            saveRevision(text, corrections);
            displayCorrection();
        } catch (error) {
            progressBar.style.display = "none";
            alert("Failed to get correction. Please check the console for more details.");
            console.error("Error fetching correction:", error);
        }
    };

    const displayCorrection = () => {
        const selectedLevel = correctionLevelSpinner.value;
        outputText.style.display = "block";
        outputText.value = corrections[selectedLevel] || "No correction available";
    };

    const saveRevision = (originalText, corrections) => {
        if (revisionHistory.length >= 20) {
            revisionHistory.shift();
        }
        revisionHistory.push({ originalText, corrections });
        updateHistoryList();
    };

    const updateHistoryList = () => {
        historyList.innerHTML = '';
        revisionHistory.forEach((revision, index) => {
            const listItem = document.createElement('li');
            listItem.classList.add('tooltip');
            listItem.textContent = `Original: ${revision.originalText}`;
            const tooltipText = document.createElement('div');
            tooltipText.classList.add('tooltiptext');
            tooltipText.innerHTML = `
                <strong>Corrector Only:</strong> ${revision.corrections["Corrector Only"]}<br>
                <strong>Corrector at High Level:</strong> ${revision.corrections["Corrector at High Level"]}<br>
                <strong>Corrector at Very High Level:</strong> ${revision.corrections["Corrector at Very High Level"]}
            `;
            listItem.appendChild(tooltipText);

            listItem.addEventListener("click", () => {
                inputText.value = revision.originalText;
                corrections = revision.corrections;
                displayCorrection();
                historyModal.style.display = "none";
            });

            historyList.appendChild(listItem);
        });
    };

    sendButton.addEventListener("click", () => {
        const text = inputText.value.trim();
        const style = styleText.value.trim();
        if (text) {
            sendTextToServer(text, style);
        } else {
            alert("Please enter some text");
        }
    });

    copyButton.addEventListener("click", () => {
        outputText.select();
        document.execCommand("copy");
        alert("Text copied to clipboard");
    });

    pasteButton.addEventListener("click", () => {
        navigator.clipboard.readText().then((text) => {
            inputText.value = text;
        });
    });

    correctionLevelSpinner.addEventListener("change", displayCorrection);

    personalDesignButton.onclick = function () {
        modal.style.display = "block";
    };

    span.onclick = function () {
        modal.style.display = "none";
    };

    closeHistory.onclick = function () {
        historyModal.style.display = "none";
    };

    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        } else if (event.target === historyModal) {
            historyModal.style.display = "none";
        }
    };

    const applyPersonalDesign = () => {
        const backgroundColor = backgroundColorInput.value;
        const textColor = textColorInput.value;
        let fontSize = fontSizeInput.value;
        const fontFamily = fontFamilySelect.value;

        if (fontSize > 35) {
            fontSize = 35;
            fontSizeInput.value = 35;
        }

        document.body.style.backgroundColor = backgroundColor;
        document.body.style.color = textColor;
        document.body.style.fontFamily = fontFamily;

        inputText.style.fontSize = `${fontSize}px`;
        outputText.style.fontSize = `${fontSize}px`;

        const elements = document.querySelectorAll("button, select, textarea, input[type='color'], input[type='number']");
        elements.forEach(element => {
            element.style.color = textColor;
            element.style.borderColor = textColor;
            element.style.backgroundColor = backgroundColor;
        });

        const container = document.querySelector('.container');
        if (layout === 'side-by-side') {
            container.classList.add('side-by-side');
        } else {
            container.classList.remove('side-by-side');
        }
    };

    backgroundColorInput.addEventListener("input", applyPersonalDesign);
    textColorInput.addEventListener("input", applyPersonalDesign);
    fontSizeInput.addEventListener("input", applyPersonalDesign);
    fontFamilySelect.addEventListener("change", applyPersonalDesign);

    const synth = window.speechSynthesis;

    playButton.addEventListener("click", () => {
        const utterThis = new SpeechSynthesisUtterance(outputText.value);
        synth.speak(utterThis);
    });

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recordButton.addEventListener("click", () => {
        recognition.start();
    });

    recognition.addEventListener("result", (event) => {
        const transcript = event.results[0][0].transcript;
        inputText.value = transcript;
    });

    recognition.addEventListener("speechend", () => {
        recognition.stop();
    });

    recognition.addEventListener("error", (event) => {
        alert(`Error occurred in recognition: ${event.error}`);
    });

    historyButton.addEventListener("click", () => {
        historyModal.style.display = "block";
    });

    const openMenuButton = document.getElementById("openMenuButton");
    const closeMenuButton = document.getElementById("closeMenuButton");
    const sideMenu = document.getElementById("sideMenu");

    openMenuButton.addEventListener("click", () => {
        sideMenu.style.width = "250px";
    });

    closeMenuButton.addEventListener("click", () => {
        sideMenu.style.width = "0";
    });
});
