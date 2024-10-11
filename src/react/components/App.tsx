import React, { useState, useEffect, Suspense } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Button, IconButton } from '@mui/material';
import SummarizeIcon from '@mui/icons-material/Summarize';
import SaveIcon from '@mui/icons-material/Save';
import useAuth from '../hooks/useAuth';
import AuthGuard from './AuthGuard';
import { DeniceSummaryApi } from '../services/DeniceSummaryApi';
import { DeepChat } from 'deep-chat-react'; 
import { SummarizedDocument } from '../model/documents';
import { ClearAll } from '@mui/icons-material';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
  },
});

// Set the assistant name as a variable
const ASSISTANT_NAME = 'Denice_v0.0.1-Chrome-Extension';

const App = () => {
  const { isAuthenticated, refreshAuthStatus } = useAuth();
  const [summary, setSummary] = useState<SummarizedDocument | null>(null);
  const [sourceContent, setSourceContent] = useState<string | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [hasSummarized, setHasSummarized] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);
  const apiHost = process.env.API_HOST || 'http://localhost:3000'; // Fallback in case environment variable is not set
  

  const api = new DeniceSummaryApi();
  useEffect(() => {
      const onMount = async () => {
          // ON MOUNT
          console.log('on mount');
          const activeTab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
              if (activeTab && activeTab.id) {
                await chrome.action.setBadgeText({
                  tabId: activeTab.id,
                  text: "ON",
              });
              await chrome.action.setBadgeBackgroundColor({
                  tabId: activeTab.id,
                  color: '#99FF99',
              });
              chrome.runtime.connect({ name: "popup" });  
              await chrome.scripting.executeScript({
                files: ["activeTab.js"],
                  target: { tabId: activeTab.id },
              });          
          }
      }

      const onUnmount = async () => {
          // ON UNMOUNT
      }

      onMount().catch(console.error);
      return () => {
          onUnmount().catch(console.error);
      }
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
  }, []);

  async function fetchData(reset: boolean = false): Promise<any[]> {
    try {
      if (!loaded || reset) {
        console.log('fetching chat history');
        let initUrl = `${apiHost}/api/chat/init?a=${ASSISTANT_NAME}`;
        if (reset) {
          initUrl += '&reset=true';
        }
        console.log('initUrl', initUrl);
        const initResponse = await fetch(initUrl, {});
        const data = await initResponse.json();
        setLoaded(true);
        setChatHistory(data);
        return data;
      } else {
        console.log('chat history already loaded');
      }
    } catch (error) {
      console.error(error);
      setLoaded(true);
      const data = [
        {"text": "Hello, I'm Denice, your research assistant at Nuevco. I'm here to help you.", "role": "ai"}
      ];
      setChatHistory(data);
      return data;
    }
    return [];
  }


  // Fetch chat history from the API and set it
  useEffect(() => {
    fetchData().then((data) => {
        setLoaded(true);
    });
  }, [loaded]);

  // Function to send page for summary
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
              const resultSummary = await api.summarizePage(response);
              
              setSummary(resultSummary);
              setHasSummarized(true);
              setChatHistory((prev) => [
                ...prev,
                { role: 'assistant', text: resultSummary.summary },
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

  const clearChat = async () => {
      await fetchData(true);
  }

  const saveSummary = async () => {
    if (summary && sourceContent && sourceUrl) {
      try {
        const message = await api.saveSummary(
          summary);
        setChatHistory((prev) => [
            ...prev,
            { role: 'assistant', text: message },
          ]);
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

  const url = `${apiHost}/api/chat?a=${ASSISTANT_NAME}`;
  console.log('url', url);
  
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          width: '450px', // Keep your exact width
          height: '575px', // Keep your exact height
          padding: '0',
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
          <>
            <IconButton
              onClick={clearChat}
              sx={{
                position: 'fixed',
                top: '20px',
                right: '65px',
                backgroundColor: '#1976d2',
                color: '#fff',
                borderRadius: '10px',
                padding: '8px',
                '&:hover': { 
                  backgroundColor: '#1565c0'
                },
                zIndex: 1001,
              }}
            >
              <ClearAll />
            </IconButton>
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
                zIndex: 1001,
              }}
            >
              {hasSummarized ? <SaveIcon /> : <SummarizeIcon />}
            </IconButton>
          </>
        )}

        <AuthGuard>
          {!isAuthenticated && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleLogin}
              sx={{
                position: 'absolute',
                top: '120px',
                zIndex: 1001,
              }}
            >
              Login
            </Button>
          )}

          {isAuthenticated && (
            <Box
              sx={{
                paddingTop: '110px',
                left: 0,
                width: '100%',
                height: '475px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <Suspense
                fallback={<div>Loading Chat...</div>}>
                <DeepChat
                    style={{
                        borderRadius: '10px',
                        width: '440px',
                        height: '460px',
                    }}
                    history={chatHistory}
                    messageStyles={{"default": 
                        {"ai": { "bubble": { 
                            "minWidth": "95%", 
                            "width" : "95%" 
                        }, "outerContainer": { "width" : "95%", "padding": "10px" }, "innerContainer": { "width" : "100%"} }, "shared": {"innerContainer": {"fontSize": "1rem" }}}}}
                    textInput={{
                        disabled: !loaded && !!chatHistory.length, 
                        placeholder: { text: 'Welcome to the demo!' } 
                    }}
                    connect={{ url: url, additionalBodyProps: { model: 'gpt-4o-mini' } }}
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
