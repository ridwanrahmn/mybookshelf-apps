const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APPS";

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

function generateId() {
  return +new Date();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) return bookItem;
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) return index;
  }
  return -1;
}

function addTaskCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget === null) return;
  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoTaskCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget === null) return;
  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeTaskCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);
  if (bookTarget === -1) return;
  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function modalWindowAdd() {
  const modalWindow = document.querySelector(".modal-section");
  modalWindow.classList.remove("hidden");
  const overlayBackground = document.querySelector(".overlay");
  overlayBackground.classList.remove("hidden");
}

function modalWindowRemove() {
  const modalWindow = document.querySelector(".modal-section");
  modalWindow.classList.add("hidden");
  const overlayBackground = document.querySelector(".overlay");
  overlayBackground.classList.add("hidden");
}

function removeTaskModalWindow(bookObject) {
  modalWindowAdd();
  const yesButton = document.getElementById("buttonYes");
  const noButton = document.getElementById("buttonNo");

  yesButton.addEventListener("click", function () {
    removeTaskCompleted(bookObject.id);
    modalWindowRemove();
  });

  noButton.addEventListener("click", function () {
    modalWindowRemove();
  });
}

function makeBook(bookObject) {
  const bookTitle = document.createElement("h3");
  bookTitle.classList.add("book-title");
  bookTitle.innerText = bookObject.title;

  const bookAuthor = document.createElement("p");
  bookAuthor.innerText = `Penulis: ${bookObject.author}`;

  const bookYear = document.createElement("p");
  bookYear.innerText = `Tahun: ${bookObject.year}`;

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("action");

  const container = document.createElement("article");
  container.classList.add("book-item");
  container.append(bookTitle, bookAuthor, bookYear, buttonContainer);
  container.setAttribute("id", `book-${bookObject.id}`);

  if (!bookObject.isComplete) {
    const doneButton = document.createElement("button");
    doneButton.classList.add("green");
    doneButton.textContent = "Selesai dibaca";

    doneButton.addEventListener("click", function () {
      addTaskCompleted(bookObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("red");
    trashButton.textContent = "Hapus buku";

    trashButton.addEventListener("click", function () {
      removeTaskModalWindow(bookObject);
    });

    buttonContainer.append(doneButton, trashButton);
  } else {
    const undoButton = document.createElement("button");
    undoButton.classList.add("green");
    undoButton.textContent = "Belum selesai dibaca";

    undoButton.addEventListener("click", function () {
      undoTaskCompleted(bookObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("red");
    trashButton.textContent = "Hapus buku";

    trashButton.addEventListener("click", function () {
      removeTaskModalWindow(bookObject);
    });

    buttonContainer.append(undoButton, trashButton);
  }
  return container;
}

function addBook() {
  const titleEl = document.getElementById("inputBookTitle").value;
  const authorEl = document.getElementById("inputBookAuthor").value;
  const yearEl = document.getElementById("inputBookYear").value;
  const yearElNum = parseInt(yearEl);
  const isCompleteEl = document.getElementById("inputBookIsComplete").checked;

  const generateID = generateId();
  const bookObject = generateBookObject(
    generateID,
    titleEl,
    authorEl,
    yearElNum,
    isCompleteEl
  );
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function filterSearch() {
  const searchInput = document.getElementById("searchBookTitle");
  const filter = searchInput.value.toLowerCase();
  const listItems = document.querySelectorAll(".book-item");
  const itemsName = document.querySelectorAll(".book-title");

  itemsName.forEach((items, index) => {
    let text = items.textContent;
    if (text.toLowerCase().includes(filter.toLowerCase())) {
      listItems[index].style.display = "";
    } else {
      listItems[index].style.display = "none";
    }
  });
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser not supported local storage");
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener("DOMContentLoaded", function () {
  const submitInputBook = document.getElementById("inputBook");
  submitInputBook.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
    submitInputBook.reset();
  });
  const filteredSearch = document.getElementById("searchBookTitle");
  filteredSearch.addEventListener("input", function () {
    filterSearch();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(RENDER_EVENT, function () {
  const incompletedBook = document.getElementById("incompleteBookShelfList");
  incompletedBook.innerHTML = "";

  const completedBook = document.getElementById("completeBookShelfList");
  completedBook.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isComplete) {
      incompletedBook.append(bookElement);
    } else {
      completedBook.append(bookElement);
    }
  }
});

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});
