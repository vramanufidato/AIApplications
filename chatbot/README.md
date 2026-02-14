# Research Librarian AI Chatbot

This project is an autonomous Research Librarian AI chatbot that provides deep, evidence-based answers using a local Knowledge Base (RAG) and the web. The chatbot is designed with human psychology in mind for its color scheme and imagery to create a calm, trustworthy, and intelligent user experience.

## Features

-   **Context Check:** For every query, the AI first searches the `./books` folder using a RAG (Retrieval-Augmented Generation) system to retrieve relevant passages from existing PDFs.
-   **Topic Gap Analysis:** If a query's topic is not sufficiently covered by the local knowledge base, the AI uses a Book Downloader Tool to find and download the 5 best books on the topic from `oceanofpdf.com`. These are then placed in the `./books` folder, and the RAG system is re-indexed.
-   **Web Search Trigger:** For queries involving "latest news," "future technology," or "real-time events," the AI skips book downloads and utilizes the Google Search Tool.
-   **Synthesis and Citation:** All information provided by the AI is meticulously cited, indicating whether it originated from a specific PDF in the `./books` folder or a live web search.

## Project Structure

-   `backend/`: Contains the Node.js Express server.
-   `frontend/`: Contains the React application.
-   `books/`: This directory will store PDF books for the RAG system.

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

-   Node.js (LTS version recommended)
-   npm (comes with Node.js)

### Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install the backend dependencies:
    ```bash
    npm install
    ```
3.  Start the backend server in development mode (with nodemon for automatic restarts):
    ```bash
    npm run dev
    ```
    The backend server will run on `http://localhost:3001`.

### Frontend Setup

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install the frontend dependencies:
    ```bash
    npm install
    ```
3.  Start the frontend development server:
    ```bash
    npm run dev
    ```
    The frontend application will typically run on `http://localhost:5173`.

### Full Stack (Backend and Frontend)

1.  Open two terminal windows.
2.  In the first terminal, navigate to the `backend` directory and run `npm run dev`.
3.  In the second terminal, navigate to the `frontend` directory and run `npm run dev`.
4.  Open your web browser and go to `http://localhost:5173` to access the chatbot.

## Usage

Interact with the chatbot by typing your queries into the input field. The AI will process your request, utilizing its local knowledge base and web search capabilities as needed, and provide an evidence-based response with citations.

### Testing the Application (Bhagavad Gita Example)

To test the application's ability to retrieve information from the local knowledge base:

1.  Ensure the `_OceanofPDF.com_Philosophy_of_the_Bhagavad_Gita_-_Keya_Maitra.pdf` file is present in the `./books` directory.
2.  Start both the backend and frontend servers as described above.
3.  In the chatbot interface, type a query related to the Bhagavad Gita, for example: "Summarize the key philosophical concepts of the Bhagavad Gita."
4.  The bot should provide an answer, citing the local PDF.

## Future Enhancements

-   Full implementation of RAG system (vector database, PDF parsing).
-   Integration with a real web search API (e.g., Google Custom Search API).
-   Integration of the Book Downloader Tool with `oceanofpdf.com`.
-   More sophisticated UI/UX with better styling and responsiveness.
-   Error handling and loading states for a better user experience.
-   User authentication and persistent chat history.
