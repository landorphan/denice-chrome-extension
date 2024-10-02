chrome.runtime.onMessage.addListener(async function (msg, sender, sendResponse) {
    if (msg.action === 'summarize') {
        const pageContent = document.documentElement.outerHTML;

        try {
            // Commenting out the fetch call for now

            const response = await fetch('http://localhost:3000/api/denice/summarize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: pageContent }),
            });

            const result = await response.json();
            const summary = result.summary || 'No summary available';

            // Calculate the size of the content in bytes
            const contentSize = new Blob([pageContent]).size;

            console.log('Page content size:', contentSize, 'bytes');

            // Send the content size back to the popup
            chrome.runtime.sendMessage({ summary: summary });
        } catch (error) {
            console.error('Failed to get summary:', error);
        }
    }
});
