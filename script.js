// Elementi della pagina
const homePage = document.getElementById("home-page");
const chatPage = document.getElementById("chat-page");
const chatList = document.getElementById("chat-list");
const noteContainer = document.getElementById("note-container");
const addChatButton = document.getElementById("add-chat");
const backButton = document.getElementById("back-button");
const chatTitle = document.getElementById("chat-title");

// Variabile globale per tracciare la chat corrente
let currentChatName = "";

// Funzione per aprire una chat
function openChat(name) {
  currentChatName = name; // Aggiorna la chat corrente
  homePage.style.display = "none";
  chatPage.style.display = "block";
  chatTitle.innerText = name;

  // Pulire il contenitore delle note
  noteContainer.innerHTML = "";

  // Caricare le note specifiche per questa chat
  const notes = JSON.parse(localStorage.getItem(name)) || [];

  if (notes.length === 0) {
    // Se non ci sono note salvate, crea un paragrafo di default
    addNoteBlock("Titolo iniziale", "Testo iniziale");
    saveNotes(); // Salva subito il paragrafo di default
  } else {
    // Altrimenti carica le note esistenti
    loadNotes();
  }
}

// Tornare alla homepage
backButton.addEventListener("click", () => {
  currentChatName = ""; // Resetta la chat corrente
  chatPage.style.display = "none";
  homePage.style.display = "block";
});

// Aggiungere una nuova chat
addChatButton.addEventListener("click", () => {
  const chatName = prompt("Inserisci il nome della chat:");
  if (chatName) {
    const chatItem = document.createElement("div");
    chatItem.classList.add("chat-item");
    chatItem.innerHTML = `
      <span>${chatName}</span>
      <button onclick="deleteChat(this)">X</button>
    `;
    chatItem.addEventListener("click", () => openChat(chatName));
    chatList.appendChild(chatItem);

    // Crea il paragrafo di default e salva le note per questa chat
    localStorage.setItem(chatName, JSON.stringify([{ title: "Titolo iniziale", text: "Testo iniziale" }]));

    // Carica la chat subito dopo la creazione
    openChat(chatName);
  }
});

// Eliminare una chat
function deleteChat(button) {
  const chatName = button.parentElement.querySelector("span").textContent;
  localStorage.removeItem(chatName); // Rimuove i dati della chat dal localStorage
  button.parentElement.remove();
}

// Aggiungere un nuovo blocco di note
function addNoteBlock(title = "Titolo...", text = "Testo...") {
  const noteBlock = document.createElement("div");
  noteBlock.classList.add("note-block");

  const noteTitle = document.createElement("div");
  noteTitle.classList.add("note-title");
  noteTitle.contentEditable = true;
  noteTitle.textContent = title;

  const noteText = document.createElement("div");
  noteText.classList.add("note-text");
  noteText.contentEditable = true;
  noteText.textContent = text;

  // Aggiungere il pulsante di cancellazione (X)
  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-btn");
  deleteButton.innerHTML = "&#10006;";
  deleteButton.addEventListener("click", () => {
    if (confirm("Sei sicuro di voler eliminare questo paragrafo?")) {
      noteBlock.remove();
      saveNotes();
    }
  });

  // Posiziona la X all'estremità destra del titolo
  const titleWrapper = document.createElement("div");
  titleWrapper.classList.add("note-title-wrapper");
  titleWrapper.appendChild(noteTitle);
  titleWrapper.appendChild(deleteButton);

  // Appendi il titolo, X e testo
  noteBlock.appendChild(titleWrapper);
  noteBlock.appendChild(noteText);
  noteContainer.appendChild(noteBlock);

  // Salvare le modifiche sui cambiamenti
  const saveOnChange = () => saveNotes();
  noteTitle.addEventListener("input", saveOnChange);
  noteText.addEventListener("input", saveOnChange);

  // Funzionalità 1: il titolo può avere solo una riga
  noteTitle.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      noteText.focus(); // Passa al testo
    }
  });

  // Funzionalità 2: gestione di invio multiplo nella nota
  let enterCount = 0;

  noteText.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      enterCount++;
      if (enterCount === 3) {
        // Cancella gli ultimi due invii e aggiunge un nuovo blocco
        noteText.textContent = noteText.textContent.replace(/\n{2}$/, "");
        const newNoteBlock = addNoteBlock();
        saveNotes();
        enterCount = 0;

        // Passa al titolo del nuovo blocco
        newNoteBlock.querySelector(".note-title").focus();
      } else {
        document.execCommand("insertLineBreak");
      }
    } else {
      enterCount = 0;
    }
  });

  // Gestire il placeholder per noteTitle
  noteTitle.addEventListener("focus", () => {
    if (noteTitle.textContent === "Titolo...") {
      noteTitle.textContent = "";
    }
  });

  noteTitle.addEventListener("blur", () => {
    if (noteTitle.textContent.trim() === "") {
      noteTitle.textContent = "Titolo...";
    }
  });

  // Gestire il placeholder per noteText
  noteText.addEventListener("focus", () => {
    if (noteText.textContent === "Testo...") {
      noteText.textContent = "";
    }
  });

  noteText.addEventListener("blur", () => {
    if (noteText.textContent.trim() === "") {
      noteText.textContent = "Testo...";
    }
  });

  // Gestione del placeholder per il paragrafo di default
  if (noteTitle.textContent === "Titolo iniziale") {
    noteTitle.addEventListener("focus", () => {
      if (noteTitle.textContent === "Titolo iniziale") {
        noteTitle.textContent = "";
      }
    });
    noteTitle.addEventListener("blur", () => {
      if (noteTitle.textContent.trim() === "") {
        noteTitle.textContent = "Titolo iniziale";
      }
    });
  }

  if (noteText.textContent === "Testo iniziale") {
    noteText.addEventListener("focus", () => {
      if (noteText.textContent === "Testo iniziale") {
        noteText.textContent = "";
      }
    });
    noteText.addEventListener("blur", () => {
      if (noteText.textContent.trim() === "") {
        noteText.textContent = "Testo iniziale";
      }
    });
  }

  // Funzionalità per modificare la nota con un solo click
  noteTitle.addEventListener("click", () => {
    noteTitle.contentEditable = true; // Permette di modificare il titolo
    noteTitle.focus();
  });

  noteText.addEventListener("click", () => {
    noteText.contentEditable = true; // Permette di modificare il testo
    noteText.focus();
  });

  return noteBlock;
}

// Caricare le note della chat corrente
function loadNotes() {
  const notes = JSON.parse(localStorage.getItem(currentChatName)) || [];
  notes.forEach(note => addNoteBlock(note.title, note.text));
}

// Salvare le note della chat corrente
function saveNotes() {
  const notes = [];
  const noteBlocks = noteContainer.getElementsByClassName("note-block");

  Array.from(noteBlocks).forEach(block => {
    const noteTitle = block.querySelector(".note-title").textContent.trim();
    const noteText = block.querySelector(".note-text").textContent.trim();

    if (noteTitle || noteText) {
      notes.push({ title: noteTitle, text: noteText });
    }
  });

  localStorage.setItem(currentChatName, JSON.stringify(notes));
}
