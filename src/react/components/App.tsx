import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Button, IconButton, TextField } from '@mui/material';
import SummarizeIcon from '@mui/icons-material/Summarize';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import useAuth from '../hooks/useAuth';
import AuthGuard from './AuthGuard';
import { DeniceSummaryApi } from '../services/DeniceSummaryApi';

const theme = createTheme({
    palette: {
        primary: { main: '#1976d2' },
    },
});

const App = () => {
    const { isAuthenticated, refreshAuthStatus } = useAuth();
    const [summary, setSummary] = useState<string | null>(null);
    const [sourceContent, setSourceContent] = useState<string | null>(null);
    const [sourceUrl, setSourceUrl] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>(''); 
    const [searchResults, setSearchResults] = useState<any[]>([]);

    const api = new DeniceSummaryApi();

    const sendPageForSummary = async () => {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const activeTab = tabs[0];

        if (activeTab?.id) {
            chrome.tabs.sendMessage(activeTab.id, { action: 'gatherPageData' }, async (response) => {
                if (response) {
                    setSourceContent(response.content);
                    setSourceUrl(response.url);

                    try {
                        const resultSummary = await api.summarizePage(response.content, response.url);
                        setSummary(resultSummary);
                    } catch (error) {
                        console.error(error);
                    }
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
            try {
                const message = await api.saveSummary(summary, sourceContent, sourceUrl);
                alert(message);
            } catch (error) {
                console.error(error);
                alert('Error saving content');
            }
        } else {
            console.error("Summary or content missing.");
        }
    };

    const handleSearch = async () => {
        if (!searchQuery) {
            console.error('Search query is empty');
            return;
        }

        try {
            const results = await api.searchSummaries(searchQuery);
            setSearchResults(results);
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
    };

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
                <Box
                    component="img"
                    src="assets/denicebanner.png"
                    alt="Denice Banner"
                    sx={{
                        width: '100%',
                        height: 'auto',
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
                                        marginLeft: '10px',
                                    }}
                                >
                                    <SaveIcon />
                                </IconButton>
                            )}

                            <IconButton
                                onClick={() => setIsSearching(!isSearching)}
                                sx={{
                                    backgroundColor: '#ff9800',
                                    color: '#fff',
                                    borderRadius: '50px',
                                    padding: '10px 20px',
                                    '&:hover': {
                                        backgroundColor: '#f57c00',
                                    },
                                    marginLeft: '10px',
                                }}
                            >
                                <SearchIcon />
                            </IconButton>
                        </Box>
                    )}

                    {isSearching && (
                        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <TextField
                                label="Search Summaries"
                                variant="outlined"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                multiline
                                rows={2}
                                fullWidth
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                sx={{ mt: 2 }}
                                onClick={handleSearch}
                            >
                                Search
                            </Button>
                        </Box>
                    )}

                    {summary && (
                        <Box mt={4}>
                            <Box sx={{ fontSize: '18px', fontWeight: 'bold' }}>Summary:</Box>
                            <Box sx={{ fontSize: '16px' }}>{summary}</Box>
                        </Box>
                    )}

                    {searchResults.length > 0 && (
                        <Box mt={4}>
                            <Box sx={{ fontSize: '18px', fontWeight: 'bold' }}>Search Results:</Box>
                            <Box>
                                {searchResults.map((result, index) => (
                                    <Box key={index} sx={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
                                        <strong>{result.score}</strong> - {result.url}
                                        <p>{result.summary}</p>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}
                </AuthGuard>
            </Box>
        </ThemeProvider>
    );
};

export default App;
