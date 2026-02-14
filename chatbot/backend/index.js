const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = 3001;
const BOOKS_DIR = path.join(__dirname, '..', 'books');
const OCEANOFPDF_URL = 'https://oceanofpdf.com';

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Research Librarian AI Backend is running!');
});

// Ensure the books directory exists
async function ensureBooksDirectory() {
    try {
        await fs.promises.mkdir(BOOKS_DIR, { recursive: true });
        console.log(`Ensured books directory exists at ${BOOKS_DIR}`);
    } catch (error) {
        console.error('Error ensuring books directory:', error);
    }
}

let knowledgeBase = []; // This will store our indexed PDF content

// Function to load and parse PDF documents
async function loadPdfDocuments() {
    console.log('Loading PDF documents from:', BOOKS_DIR);
    const pdfDocuments = [];
    try {
        const files = await fs.promises.readdir(BOOKS_DIR);
        for (const file of files) {
            if (file.endsWith('.pdf')) {
                const filePath = path.join(BOOKS_DIR, file);
                console.log('Parsing PDF:', filePath);
                const dataBuffer = await fs.promises.readFile(filePath);
                const parser = new PDFParse({ data: dataBuffer });
                const data = await parser.getText();
                pdfDocuments.push({
                    title: file,
                    text: data.text,
                });
            }
        }
        console.log(`Loaded ${pdfDocuments.length} PDF documents.`);
    } catch (error) {
        console.error('Error loading PDF documents:', error);
    }
    return pdfDocuments;
}

// Function to index documents (simple keyword-based for now)
function indexDocuments(documents) {
    console.log('Indexing documents...');
    const indexedData = [];
    documents.forEach(doc => {
        const words = doc.text.toLowerCase().split(/\W+/).filter(word => word.length > 2);
        indexedData.push({
            title: doc.title,
            words: Array.from(new Set(words)), // Store unique words
            originalText: doc.text // Store original text for retrieval
        });
    });
    console.log(`Indexed ${indexedData.length} documents.`);
    return indexedData;
}

// Function to perform RAG search
async function performRagSearch(query) {
    const queryWords = query.toLowerCase().split(/\W+/).filter(word => word.length > 2);
    const results = [];

    // Simple scoring: count how many query words appear in each document
    knowledgeBase.forEach(doc => {
        let score = 0;
        queryWords.forEach(qWord => {
            if (doc.words.includes(qWord)) {
                score++;
            }
        });
        if (score > 0) {
            results.push({ title: doc.title, score, text: doc.originalText });
        }
    });

    results.sort((a, b) => b.score - a.score); // Sort by score descending

    // For simplicity, return the most relevant document's text
    if (results.length > 0) {
        // Find a relevant passage instead of the whole text
        const bestDoc = results[0];
        const sentences = bestDoc.text.split(/(?<=[.!?])\s+/);
        const relevantSentences = sentences.filter(sentence => 
            queryWords.some(qWord => sentence.toLowerCase().includes(qWord))
        );
        
        let responseText = '';
        if (relevantSentences.length > 0) {
            // Take the first few relevant sentences
            responseText = relevantSentences.slice(0, 3).join(' ') + '...';
        } else {
            // Fallback to the beginning of the document if no specific sentences are found
            responseText = bestDoc.originalText.substring(0, 500) + '...';
        }

        return {
            source: bestDoc.title,
            text: responseText
        };
    }
    return null;
}

// Initialize knowledge base on startup
async function initializeKnowledgeBase() {
    await ensureBooksDirectory();
    const documents = await loadPdfDocuments();
    knowledgeBase = indexDocuments(documents);
}

(async () => {
    await initializeKnowledgeBase();
    app.listen(port, () => {
        console.log(`Backend server listening at http://localhost:${port}`);
    });
})();

// RAG Search Endpoint
app.post('/rag_search', async (req, res) => {
    const { query } = req.body;
    console.log(`RAG Search query: ${query}`);
    const result = await performRagSearch(query);
    if (result) {
        res.json({ source: result.source, answer: result.text });
    } else {
        res.json({ source: 'Local Knowledge Base', answer: 'No relevant information found in local books.' });
    }
});

// Book Download Endpoint
app.post('/download_books', async (req, res) => {
    const { topic } = req.body;
    console.log(`Book download topic: ${topic}`);
    
    try {
        const searchUrl = `${OCEANOFPDF_URL}/?s=${encodeURIComponent(topic)}`;
        const { data } = await axios.get(searchUrl);
        const $ = cheerio.load(data);
        
        const bookLinks = [];
        $('.elementor-post__text a').each((i, element) => {
            if (bookLinks.length < 5) {
                const link = $(element).attr('href');
                if (link && link.includes(OCEANOFPDF_URL)) {
                    bookLinks.push(link);
                }
            }
        });

        if (bookLinks.length === 0) {
            return res.json({ result: `No books found for topic: ${topic} on oceanofpdf.com.`, downloaded_files: [] });
        }

        const downloadedFiles = [];
        for (const bookPageUrl of bookLinks) {
            console.log('Visiting book page:', bookPageUrl);
            const bookPageResponse = await axios.get(bookPageUrl);
            const $$ = cheerio.load(bookPageResponse.data);
            const downloadLink = $$('a:contains("Download")').attr('href'); // Look for a link with "Download" text

            if (downloadLink) {
                const bookTitle = $$('h1').text().trim().replace(/[^a-z0-9]/gi, '_').toLowerCase();
                const filePath = path.join(BOOKS_DIR, `${bookTitle}.pdf`);
                console.log(`Attempting to download ${bookTitle}.pdf from ${downloadLink}`);
                
                try {
                    const response = await axios({
                        method: 'get',
                        url: downloadLink,
                        responseType: 'stream',
                    });
                    
                    const writer = require('fs').createWriteStream(filePath);
                    response.data.pipe(writer);

                    await new Promise((resolve, reject) => {
                        writer.on('finish', resolve);
                        writer.on('error', reject);
                    });
                    console.log(`Downloaded: ${filePath}`);
                    downloadedFiles.push(filePath);
                } catch (downloadError) {
                    console.error(`Error downloading ${bookTitle}.pdf:`, downloadError.message);
                }
            }
        }
        
        // Re-initialize knowledge base after downloading new books
        await initializeKnowledgeBase();
        res.json({ result: `Downloaded ${downloadedFiles.length} books for topic: ${topic}.`, downloaded_files: downloadedFiles });

    } catch (error) {
        console.error('Error in book download:', error);
        res.status(500).json({ error: 'Failed to download books.' });
    }
});

// Google Search Endpoint (Placeholder - requires actual API integration for real results)
app.post('/google_search', (req, res) => {
    const { query } = req.body;
    console.log(`Google Search query: ${query}`);
    // Simulate a web search result
    const simulatedResult = {
        title: `Search results for "${query}"`,
        url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        snippet: `This is a simulated web search result for "${query}". For real-time information, you would integrate a Google Search API here.`
    };
    res.json({ source: 'Web Search', answer: simulatedResult });
});