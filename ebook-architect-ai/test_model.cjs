const apiKey = "AIzaSyDB8dszQbhLDidbVec-xMDqQq96HiQY-sU";
const model = "gemini-flash-latest";

async function testModel() {
    console.log(`Testing model: ${model}...`);
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: "Write a 1-sentence welcome message for an eBook architect tool."
                    }]
                }]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("API Error:", JSON.stringify(data.error, null, 2));
            process.exit(1);
        }

        console.log("Success! Response text:");
        console.log(data.candidates[0].content.parts[0].text);
    } catch (error) {
        console.error("Fatal Error:", error);
        process.exit(1);
    }
}

testModel();
