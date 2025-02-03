document.addEventListener("DOMContentLoaded", () => {
  const API_KEY = "AIzaSyD6nP6sq24ztRT2dz3FDPpPYKmo45jJNBk"; 
  const videoDisplay = document.getElementById("video-display");
  const smallVideoCardsContainer = document.querySelector(".small-video-cards");
  const viewMoreButton = document.getElementById("view-more-videos");

  // YouTube search elements
  const youtubeSearchInput = document.getElementById("youtube-search-input");
  const youtubeSearchBtn = document.getElementById("youtube-search-btn");

  // Keywords for educational videos (college-level or high school-level)
  const SEARCH_QUERY = "college lectures high school tutorials educational videos include physics,biology,programming,coding";

  // Fetch YouTube videos based on the search query
  async function fetchVideos(searchQuery = SEARCH_QUERY) {
    try {
      console.log("Fetching videos..."); // Debugging: Log to check if the function is called

      // Fetch videos based on the search query
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&q=${encodeURIComponent(
          searchQuery
        )}&part=snippet&type=video&maxResults=50`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched data:", data); // Debugging: Log the fetched data

      if (!data.items || data.items.length === 0) {
        throw new Error("No videos found for the search query.");
      }

      const videoIds = data.items.map((video) => video.id.videoId);

      // Fetch video details (duration, etc.)
      const videoDetails = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&id=${videoIds.join(",")}&part=contentDetails,snippet`
      );

      if (!videoDetails.ok) {
        throw new Error(`HTTP error! Status: ${videoDetails.status}`);
      }

      const detailsData = await videoDetails.json();
      console.log("Fetched video details:", detailsData); // Debugging: Log the video details

      // Filter videos with a duration of at least 10 minutes (600 seconds)
      const filteredVideos = detailsData.items.filter((video) => {
        const duration = parseISO8601Duration(video.contentDetails.duration);
        return duration >= 600; // Only include videos longer than 10 minutes
      });

      console.log("Filtered videos:", filteredVideos); // Debugging: Log the filtered videos

      // Display videos if available
      if (filteredVideos.length > 0) {
        const randomVideos = getRandomVideos(filteredVideos, 4); // Get 4 random videos
        displaySmallVideoCards(randomVideos); // Display small video cards
        displayVideo(randomVideos[0]); // Display the first video as the main video
      } else {
        console.warn("No videos found with a duration of at least 10 minutes.");
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
      videoDisplay.innerHTML = `<p>Error fetching videos: ${error.message}</p>`;
    }
  }

  // Parse YouTube video duration (ISO 8601 format)
  function parseISO8601Duration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = parseInt(match[1] || "0", 10) * 3600;
    const minutes = parseInt(match[2] || "0", 10) * 60;
    const seconds = parseInt(match[3] || "0", 10);
    return hours + minutes + seconds;
  }

  // Get random videos from the list
  function getRandomVideos(videos, count) {
    return videos.sort(() => 0.5 - Math.random()).slice(0, count);
  }

  // Display the main video
  function displayVideo(video) {
    videoDisplay.innerHTML = `
      <iframe width="100%" height="100%" src="https://www.youtube.com/embed/${video.id}" frameborder="0" allowfullscreen></iframe>
      <h3>${video.snippet.title}</h3>
    `;
  }

  // Display small video cards
  function displaySmallVideoCards(videos) {
    smallVideoCardsContainer.innerHTML = "";
    videos.forEach((video) => {
      const card = document.createElement("div");
      card.classList.add("small-card");
      card.innerHTML = `
        <img src="${video.snippet.thumbnails.high.url}" alt="${video.snippet.title}">
        <h4>${video.snippet.title}</h4>
      `;
      card.addEventListener("click", () => displayVideo(video));
      smallVideoCardsContainer.appendChild(card);
    });
  }

  // View more videos button (redirects to a YouTube search for educational videos)
  viewMoreButton.addEventListener("click", () => {
    window.open("https://www.youtube.com/channel/UCtFRv9O2AHqOZjjynzrv-xg", "_blank");
  });

  // YouTube search functionality
  youtubeSearchBtn.addEventListener("click", () => {
    const query = youtubeSearchInput.value.trim();
    if (query) {
      fetchVideos(query); // Fetch videos based on the user's search query
    } else {
      alert("Please enter a search term.");
    }
  });

  // Fetch random books from OpenLibrary
  const librarySection = document.getElementById('library');
  const gridContainer = librarySection.querySelector('.grid');
  const exploreButton = librarySection.querySelector('button');

  // Fetch genres from OpenLibrary
  const genres = ["fiction", "science", "history", "fantasy", "biography", "philosophy", "art", "technology"];

  async function fetchRandomBooks() {
    const randomGenre = genres[Math.floor(Math.random() * genres.length)];
    try {
      const response = await fetch(`https://openlibrary.org/subjects/${randomGenre}.json?limit=50`);
      const data = await response.json();
      const freeBooks = data.works.filter(book => book.availability && book.availability.status === "open");
      const shuffledBooks = freeBooks.sort(() => 0.5 - Math.random()).slice(0, 6);

      const books = await Promise.all(shuffledBooks.map(async work => {
        const bookDetails = await fetch(`https://openlibrary.org${work.key}.json`);
        const bookData = await bookDetails.json();

        let description = bookData.description
          ? (typeof bookData.description === "string" ? bookData.description : bookData.description.value)
          : "No description available.";
        
        // Truncate long descriptions
        description = description.length > 850 ? description.substring(0, 850) + "..." : description;

        return {
          title: work.title,
          author: work.authors && work.authors.length > 0 ? work.authors[0].name : "Unknown Author",
          coverUrl: work.cover_id ? `https://covers.openlibrary.org/b/id/${work.cover_id}-M.jpg` : "https://openlibrary.org/images/icons/avatar_book-sm.png",
          bookUrl: `https://openlibrary.org${work.key}`,
          description: description
        };
      }));

      displayBooks(books);
    } catch (error) {
      console.error("Error fetching books:", error);
      displayError("An error occurred while fetching books.");
    }
  }

  // Display books in the grid
  function displayBooks(books) {
    gridContainer.innerHTML = books.length ? '' : '<p>No books found.</p>';
    books.forEach(book => {
      const card = document.createElement('div');
      card.classList.add('card');
      card.innerHTML = `<img src="${book.coverUrl}" alt="Book Cover">`;
      card.addEventListener("click", () => showBookPopup(book));
      gridContainer.appendChild(card);
    });
  }

  // Show book popup with details
  function showBookPopup(book) {
    let description = book.description || "No description available.";
    if (description.length > 2035) {
      description = description.substring(0, 1000) + "...";
    }

    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.innerHTML = `
      <div class="modal-content">
        <img src="${book.coverUrl.replace('-M.jpg', '-L.jpg')}" alt="Book Cover" class="modal-image">
        <div class="modal-text">
          <h3>${book.title}</h3>
          <p><strong>By:</strong> ${book.author}</p>
          <p><strong>Description:</strong> ${description}</p>
          <button onclick="window.open('${book.bookUrl}', '_blank')">Proceed to Read</button>
        </div>
        <button class="close-modal-btn">&times;</button>
      </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = "flex";

    // Close modal when the close button is clicked
    modal.querySelector(".close-modal-btn").addEventListener("click", () => {
      modal.style.display = "none";
      modal.remove();
    });

    // Close modal when clicking outside the modal content
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
        modal.remove();
      }
    });
  }

  // Search books functionality
  const searchBtn = document.getElementById('search-btn');
  const searchBar = document.getElementById('search-bar');

  searchBtn.addEventListener('click', () => {
    const query = searchBar.value.trim();
    if (query) {
      searchBooks(query);
    }
  });

  async function searchBooks(query) {
    try {
      const response = await fetch(`https://openlibrary.org/search.json?q=${query}&limit=6`);
      const data = await response.json();
  
      if (data.docs && data.docs.length > 0) {
        const books = await Promise.all(data.docs.map(async doc => {
          const title = doc.title || "No title available";
          const author = doc.author_name && doc.author_name[0] || "Unknown Author";
          const coverId = doc.cover_i;
          const bookUrl = `https://openlibrary.org${doc.key}`;
  
          let description = "No description available.";
          try {
            const bookDetails = await fetch(`https://openlibrary.org${doc.key}.json`);
            const bookData = await bookDetails.json();
            if (bookData.description) {
              let rawDescription = typeof bookData.description === "string"
                ? bookData.description
                : bookData.description.value;
              description = rawDescription.split("Revision History")[0].trim();
            }
          } catch (error) {
            console.warn("Failed to fetch book description:", error);
          }
  
          return {
            title,
            author,
            coverUrl: coverId
              ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
              : "https://openlibrary.org/images/icons/avatar_book-sm.png",
            bookUrl,
            description
          };
        }));
  
        displayBooks(books);
      } else {
        gridContainer.innerHTML = '<p>No books found for your search.</p>';
      }
    } catch (error) {
      console.error("Error fetching books:", error);
      gridContainer.innerHTML = '<p>Error occurred while searching for books.</p>';
    }
  }

  // Explore the Library button functionality
  const exploreLibraryButton = document.getElementById('explore-library');
  if (exploreLibraryButton) {
    exploreLibraryButton.addEventListener('click', () => {
      window.open('https://openlibrary.org', '_blank');
    });
  }

  // Initial fetch calls
  fetchVideos(); // Fetch videos based on the default search query
  fetchRandomBooks(); // Fetch random books
});
// Function to generate the quiz
async function generateQuiz() {
  const topic = document.getElementById("topic").value;
  if (!topic) {
    alert("Please enter a topic!");
    return;
  }

  const apiKey = "AIzaSyCyPS0MVVqoByiwAikxKjAlMMss166v3-U";  
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

  const prompt = `Generate 10 multiple-choice questions on the topic: "${topic}". Each question should be formatted as follows:

QUESTION: [Question text]
OPTIONS:
A) [Option 1]
B) [Option 2]
C) [Option 3]
D) [Option 4]
ANSWER: [Correct Option]`;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();

    // Debug: Log the entire response to understand its structure
    console.log("API Response:", data);

    if (!data.candidates || data.candidates.length === 0) {
      console.error("No candidates returned from API. Retrying...");
      alert("No response from AI. Try again with a different topic.");
      return;
    }
    
    if (!topic.trim() || topic.length < 3) {
      alert("Please enter a more specific topic (at least 3 characters).");
      return;
    }    

    const outputText = data.candidates[0].content.parts[0].text;

    if (!outputText) {
      alert("No content in the response.");
      return;
    }

    console.log("Generated Text from API:", outputText);

    // Pass the text to the function that will display the quiz in the modal
    displayQuizInModal(outputText);
  } catch (error) {
    console.error("Error generating quiz:", error);
    alert("Error generating quiz. Check the console for details.");
  }
}

// Function to display the quiz in the modal
function displayQuizInModal(quizText) {
  const quizModal = document.createElement('div');
  quizModal.classList.add('quiz-modal');
  quizModal.innerHTML = `
    <div class="quiz-modal-content">
      <span class="quiz-close-btn">&times;</span>
      <h3 id="quiz-topic-title">${document.getElementById('topic').value}</h3> <!-- Add the topic title here -->
      <form id="quiz-form">
        ${generateQuizHTML(quizText)} 
        <button type="button" onclick="submitQuiz()">Submit Quiz</button>
        <button type="button" onclick="showAnswers()">Show Answers</button>
        <p id="quiz-score"></p> <!-- Score appears here -->
      </form>
    </div>
  `;

  document.body.appendChild(quizModal);

  // Close modal when 'X' is clicked
  quizModal.querySelector(".quiz-close-btn").addEventListener("click", () => {
    quizModal.style.display = "none";
    quizModal.remove();
  });

  quizModal.style.display = "flex"; // Show the modal
}

// Function to generate the HTML for the quiz
function generateQuizHTML(quizText) {
  const questions = quizText.split("\n\n");
  let quizHTML = "";
  let questionIndex = 0;

  questions.forEach(q => {
    if (q.trim() !== "") {
      console.log("Parsing Question:", q);  // Log each question to see its content

      // Extract question, options, and answer using regex
      const questionMatch = q.match(/QUESTION:\s*(.*?)\s*OPTIONS:/s);
      const optionsMatch = q.match(/OPTIONS:\s*((.|\n)*)\s*ANSWER:/s);
      const answerMatch = q.match(/ANSWER:\s*(.*)/s);

      console.log("Question Match:", questionMatch); // Check what's matched for the question
      console.log("Options Match:", optionsMatch); // Check what's matched for the options
      console.log("Answer Match:", answerMatch); // Check what's matched for the answer

      if (questionMatch && optionsMatch && answerMatch) {
        const questionText = questionMatch[1].trim(); // Get the question
        const optionsText = optionsMatch[1].trim(); // Get the options
        const answer = answerMatch[1].trim(); // Get the answer

        console.log("Question Text:", questionText);  // Log the question text
        console.log("Options Text:", optionsText);  // Log the options text
        console.log("Answer:", answer);  // Log the answer

        // Display the question
        quizHTML += `<p><b>${questionIndex + 1}. ${questionText}</b></p>`;

        // Split the options and create radio buttons
        const options = optionsText.split('\n').filter(option => option.trim() !== "");

        options.forEach(option => {
          const optVal = option.substring(0, 1).trim(); // Extract A, B, C, D
          const optText = option.substring(2).trim(); // Extract option text
          quizHTML += `
            <label>
              <input type="radio" name="q${questionIndex}" value="${optVal}">
              ${optText}
            </label><br>
          `;
        });

        // Add the hidden correct answer
        quizHTML += `<p class="answer" id="answer${questionIndex}" style="display:none;" data-answer="${answer}">Answer: <b>${answer}</b></p>`;
        questionIndex++;
      } else {
        console.error("Error parsing the question format. Ensure the format is correct.");
      }
    }
  });

  if (!quizHTML) {
    console.error("No quiz HTML generated. Check the formatting of the input text.");
  }

  return quizHTML;
}

// Function to submit the quiz
function submitQuiz() {
  let score = 0;
  let totalQuestions = 0;

  const questionElements = document.querySelectorAll('[id^="answer"]');
  totalQuestions = questionElements.length;

  questionElements.forEach((answerElem, i) => {
    let selectedAnswer = document.querySelector(`input[name='q${i}']:checked`);
    let correctAnswer = answerElem.getAttribute("data-answer").trim().toUpperCase();

    if (selectedAnswer) {
      let userAnswer = selectedAnswer.value.trim().toUpperCase();

      if (userAnswer === correctAnswer) {
        score++;
        answerElem.classList.add("correct");
      } else {
        answerElem.classList.add("incorrect");
      }
    }

    answerElem.style.display = "block";
  });

  // Display the score below the quiz
  let scoreElement = document.getElementById("quiz-score");
  if (!scoreElement) {
    scoreElement = document.createElement("p");
    scoreElement.id = "quiz-score";
    scoreElement.style.fontSize = "18px";
    scoreElement.style.fontWeight = "bold";
    scoreElement.style.color = "white";
    document.getElementById("quiz-form").appendChild(scoreElement);
  }
  
  scoreElement.innerHTML = `Your score: <span style="color: yellow;">${score}/${totalQuestions}</span>`;
}

// Function to show answers in the modal
function showAnswers() {
  document.querySelectorAll(".answer").forEach(answer => {
    answer.style.display = "block";
  });
}

