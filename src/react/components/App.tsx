import React, { useEffect, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Button } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import SummarizeIcon from '@mui/icons-material/Summarize';
import SaveIcon from '@mui/icons-material/Save';
import useAuth from '../hooks/useAuth';
import AuthGuard from './AuthGuard';

const theme = createTheme({
    palette: {
        primary: { main: '#1976d2' },
    },
});

const App = () => {
    const { isAuthenticated, refreshAuthStatus } = useAuth();
    const [summary, setSummary] = useState<string | null>(null);
    const [sourceContent, setSourceContent] = useState<string | null>(null);  // Track the original content
    const [sourceUrl, setSourceUrl] = useState<string | null>(null);  // Track the original URL

    // Function to gather page data and summarize it
    const sendPageForSummary = async () => {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const activeTab = tabs[0];

        if (activeTab?.id) {
            // Send a message to the content script to gather page data
            chrome.tabs.sendMessage(activeTab.id, { action: 'gatherPageData' }, async (response) => {
                if (response) {
                    setSourceContent(response.content);  // Save the cleaned page content
                    setSourceUrl(response.url);  // Save the page URL
                    
                    // Fetch the summary from the backend
                    const apiHost = 'http://localhost:3000';  // Adjust this as needed
                    const summaryResponse = await fetch(`${apiHost}/api/denice/summarize`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            content: response.content,
                            url: response.url
                        }),
                    });

                    const result = await summaryResponse.json();
                    setSummary(result.summary || 'No summary available');
                } else {
                    console.error("Failed to gather page data.");
                }
            });
        } else {
            console.error("Unable to retrieve the active tab.");
        }
    };

    const saveSummary = async () => {
        if (summary && sourceContent && sourceUrl) {
            const apiHost = 'http://localhost:3000';  // Adjust this as needed
            const saveResponse = await fetch(`${apiHost}/api/denice/summarize/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    summary: summary,
                    source: sourceContent,  // Changed 'content' to 'source' to match server-side
                    url: sourceUrl,
                }),
            });
    
            const result = await saveResponse.json();
            alert(result.message || 'Error saving content');
        } else {
            console.error("Summary or content missing.");
        }
    };
    
    // Handle login button click
    const handleLogin = async () => {
        await refreshAuthStatus();
        if (!isAuthenticated) {
            chrome.runtime.sendMessage({ action: 'login' });
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    minWidth: '450px',
                    minHeight: '600px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                }}
            >
                {/* Denice Banner Image */}
                <Box
                    component="img"
                    src="assets/denicebanner.png"
                    alt="Denice Banner"
                    sx={{
                        width: '100%',
                        height: 'auto',  // Maintain aspect ratio
                        marginBottom: '20px',
                    }}
                />

                <AuthGuard>
                    {!isAuthenticated && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleLogin}
                        >
                            Login
                        </Button>
                    )}

                    {isAuthenticated && (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            {/* Summarize Button */}
                            <IconButton
                                onClick={sendPageForSummary}
                                sx={{
                                    backgroundColor: '#1976d2',
                                    color: '#fff',
                                    borderRadius: '50px',
                                    padding: '10px 20px',
                                    '&:hover': {
                                        backgroundColor: '#1565c0',
                                    },
                                }}
                            >
                                <SummarizeIcon />
                            </IconButton>

                            {/* Save Button, to the left of the Summarize Button */}
                            {summary && (
                                <IconButton
                                    onClick={saveSummary}
                                    sx={{
                                        backgroundColor: '#4caf50',
                                        color: '#fff',
                                        borderRadius: '50px',
                                        padding: '10px 20px',
                                        '&:hover': {
                                            backgroundColor: '#388e3c',
                                        },
                                        marginLeft: '10px',  // Adjust positioning
                                    }}
                                >
                                    <SaveIcon />
                                </IconButton>
                            )}
                        </Box>
                    )}

                    {/* Display the summary */}
                    {summary && (
                        <Box mt={4}>
                            <Box sx={{ fontSize: '18px', fontWeight: 'bold' }}>Summary:</Box>
                            <Box sx={{ fontSize: '16px' }}>{summary}</Box>
                        </Box>
                    )}
                </AuthGuard>
            </Box>
        </ThemeProvider>
    );
};

export default App;
