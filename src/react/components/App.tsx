import React, { useEffect, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Button, Box } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import SummarizeIcon from '@mui/icons-material/Summarize';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
});

const App = () => {
    const [summary, setSummary] = useState<string | null>(null);

    const sendPageForSummary = async () => {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id || 0, { action: 'summarize' });
    };

    useEffect(() => {
        chrome.runtime.onMessage.addListener((message) => {
            if (message.summary) {
                setSummary(message.summary);
            }
        });
    }, []);

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
                    src="assets/denicebanner.png"  // Assuming this is where the image will be placed
                    alt="Denice Banner"
                    sx={{
                        width: '100%',
                        height: 'auto',  // Maintain aspect ratio
                        marginBottom: '20px',
                    }}
                />

                {/* Icon Button Styled as Rounded, Flat Button */}
                <IconButton
                    onClick={sendPageForSummary}
                    sx={{
                        backgroundColor: '#1976d2',  // Primary color
                        color: '#fff',
                        borderRadius: '50px',  // Rounded button
                        padding: '10px 20px',
                        '&:hover': {
                            backgroundColor: '#1565c0',  // Slightly darker on hover
                        },
                    }}
                >
                    <SummarizeIcon />
                </IconButton>

                {/* Summary Content */}
                {summary && (
                    <Box mt={4}>
                        <Box sx={{ fontSize: '18px', fontWeight: 'bold' }}>Summary:</Box>
                        <Box sx={{ fontSize: '16px' }}>{summary}</Box>
                    </Box>
                )}
            </Box>
        </ThemeProvider>
    );
};

export default App;
