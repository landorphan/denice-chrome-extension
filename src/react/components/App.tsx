import React, { useState, Suspense, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Button, IconButton } from '@mui/material';
import SummarizeIcon from '@mui/icons-material/Summarize';
import SaveIcon from '@mui/icons-material/Save';
import useAuth from '../hooks/useAuth';
import AuthGuard from './AuthGuard';
import { DeniceSummaryApi } from '../services/DeniceSummaryApi';
import { DeepChat } from 'deep-chat-react';

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
  const [hasSummarized, setHasSummarized] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);

  const api = new DeniceSummaryApi();
  useEffect(() => {
    document.body.style.overflow = "hidden";
}, []);


  const sendPageForSummary = async () => {
    console.log('Sending page for summary...');
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];
    
    if (activeTab?.id) {
      chrome.tabs.sendMessage(
        activeTab.id,
        { action: 'gatherPageData' },
        async (response) => {
          if (response) {
            console.log('Received page data:', response);
            setSourceContent(response.content);
            setSourceUrl(response.url);

            try {
              const resultSummary = await api.summarizePage(
                response.content,
                response.url
              );
              setSummary(resultSummary);
              setHasSummarized(true);
              // Display the summary as a message in the chat
              setChatHistory((prev) => [
                ...prev,
                { role: 'assistant', text: resultSummary },
              ]);
            } catch (error) {
              console.error(error);
            }
          } else {
            console.error('Failed to gather page data.');
          }
        }
      );
    } else {
      console.error('Unable to retrieve the active tab.');
    }
  };

  const saveSummary = async () => {
    if (summary && sourceContent && sourceUrl) {
      try {
        const message = await api.saveSummary(
          summary,
          sourceContent,
          sourceUrl
        );
        alert(message);
        setHasSummarized(false); // Reset to allow summarizing again
      } catch (error) {
        console.error(error);
        alert('Error saving content');
      }
    } else {
      console.error('Summary or content missing.');
    }
  };

  const handleLogin = async () => {
    await refreshAuthStatus();
    if (!isAuthenticated) {
      chrome.runtime.sendMessage({ action: 'login' });
    }
  };

  const handleChatSend = async (message: string) => {
    setChatHistory((prev) => [...prev, { role: 'user', text: message }]);

    try {
      const results = await api.searchSummaries(message) as any;
      // Format the search results
      const formattedResults = results.results
        .map((result: any) => {
          return `Score: ${result.score}\nURL: ${result.url}\nSummary: ${result.summary}`;
        })
        .join('\n\n');

      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', text: formattedResults },
      ]);
    } catch (error) {
      console.error('Error fetching search results:', error);
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', text: 'An error occurred while searching.' },
      ]);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          width: '450px', // Keep your exact width
          height: '575px', // Keep your exact height
          padding: '0',
        //   display: 'flex',
        //   flexDirection: 'column',
        //   position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Fixed Logo */}
        <Box
          component="img"
          src="assets/denicebanner.png"
          alt="Denice Banner"
          sx={{
            width: '100%',
            height: 'auto',
            position: 'fixed',
            top: 0,
            left: 10,
            zIndex: 1000,
          }}
        />

        {/* Toggle Summarize/Save Button */}
        {isAuthenticated && (
          <IconButton
            onClick={hasSummarized ? saveSummary : sendPageForSummary}
            sx={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              backgroundColor: hasSummarized ? '#4caf50' : '#1976d2',
              color: '#fff',
              borderRadius: '10px',
              padding: '8px',
              '&:hover': {
                backgroundColor: hasSummarized ? '#388e3c' : '#1565c0',
              },
              zIndex: 1001, // Ensure it's above the logo and chat
            }}
          >
            {hasSummarized ? <SaveIcon /> : <SummarizeIcon />}
          </IconButton>
        )}

        <AuthGuard>
          {!isAuthenticated && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleLogin}
              sx={{
                position: 'absolute',
                top: '120px', // Ensure it's under the logo
                zIndex: 1001,
              }}
            >
              Login
            </Button>
          )}

          {isAuthenticated && (
            <Box
              sx={{
                paddingTop: '110px', // Ensure it's below the logo
                left: 0,
                width: '100%%',
                height: '475px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden', // Ensure no extra scroll on outer container
              }}
            >
              <Suspense fallback={<div>Loading Chat...</div>}>
                <DeepChat
                    style={{
                        borderRadius: '10px',
                        width: '440px',
                        height: '460px', // Use exact size you had for the chat
                    }}
                    history={chatHistory}
                    textInput={{ placeholder: { text: 'Welcome to the demo!' } }}
                />
              </Suspense>
            </Box>
          )}
        </AuthGuard>
      </Box>
    </ThemeProvider>
  );
};

export default App;
