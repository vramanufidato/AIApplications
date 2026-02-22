import { GoogleGenAI } from "@google/genai";

const apiKey = "AIzaSyDB8dszQbhLDidbVec-xMDqQq96HiQY-sU";

async function listModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(error);
    }
}

listModels();
