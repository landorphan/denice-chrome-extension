import React, { useEffect, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Button } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import SummarizeIcon from '@mui/icons-material/Summarize';
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

    // Function to send the current page for summarization
    const sendPageForSummary = async () => {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id || 0, { action: 'summarize' });
    };

    // Handle login button click
    const handleLogin = async () => {
        await refreshAuthStatus();

        // If the user is not authenticated, trigger the login event
        if (!isAuthenticated) {
            chrome.runtime.sendMessage({ action: 'login' });
        }
    };

    // Listen for messages from the extension
    useEffect(() => {
        chrome.runtime.onMessage.addListener((message) => {
            if (message.summary) {
                setSummary(message.summary);
            }
        });
    }, []);

    return (
        <ThemeProvider theme={theme}>
            {/* Main container with Denice Banner */}
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

                {/* AuthGuard wraps the main content to enforce login */}
                <AuthGuard>
                    {/* Login button when not authenticated */}
                    {!isAuthenticated && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleLogin}
                        >
                            Login
                        </Button>
                    )}

                    {/* Summarize button when authenticated */}
                    {isAuthenticated && (
                        <>
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

                            {/* Display summary content */}
                            {summary && (
                                <Box mt={4}>
                                    <Box sx={{ fontSize: '18px', fontWeight: 'bold' }}>Summary:</Box>
                                    <Box sx={{ fontSize: '16px' }}>{summary}</Box>
                                </Box>
                            )}
                        </>
                    )}
                </AuthGuard>
            </Box>
        </ThemeProvider>
    );
};

export default App;
