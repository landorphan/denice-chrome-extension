import React, { useEffect, useState } from 'react';

const App = () => {
    const [summary, setSummary] = useState<string | null>(null);

    const sendPageForSummary = async () => {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id || 0, { action: 'summarize' });
    };

    useEffect(() => {
        // Listen for the summary sent by the content script
        chrome.runtime.onMessage.addListener((message) => {
            if (message.summary) {
                setSummary(message.summary);
            }
        });
    }, []);

    return (
        <main style={{ minWidth: '450px', minHeight: '600px', fontSize: '18px' }}>
            <h1>Summarize Webpage</h1>
            <button onClick={sendPageForSummary}>Summarize Page</button>
            {summary && (
                <div>
                    <h2>Summary:</h2>
                    <p>{summary}</p>
                </div>
            )}
        </main>
    );
};

export default App;
