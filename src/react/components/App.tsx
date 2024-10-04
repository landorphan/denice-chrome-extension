import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import useAuth from '../hooks/useAuth';
import AuthGuard from './AuthGuard';
import { DeniceSummaryApi } from '../services/DeniceSummaryApi';
import DeepChat from 'deep-chat-react'; 

const App = () => {
  const { isAuthenticated, refreshAuthStatus } = useAuth();
  const [summary, setSummary] = useState<string | null>(null);
  const [sourceContent, setSourceContent] = useState<string | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [hasSummarized, setHasSummarized] = useState<boolean>(false);

  const api = new DeniceSummaryApi();

  const sendPageForSummary = async () => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];

    if (activeTab?.id) {
      chrome.tabs.sendMessage(
        activeTab.id,
        { action: 'gatherPageData' },
        async (response) => {
          if (response) {
            setSourceContent(response.content);
            setSourceUrl(response.url);

            try {
              const resultSummary = await api.summarizePage(
                response.content,
                response.url
              );
              setSummary(resultSummary);
              setHasSummarized(true);
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

  // Function to handle messages sent from DeepChat
  const handleDeepChatMessage = async (message: string) => {
    // If the user is searching, call the search API
    try {
      const results = await api.searchSummaries(message);
      // Format the search results into a response
      const formattedResults = results
        .map(
          (result: any) =>
            `Score: ${result.score}\nURL: ${result.url}\nSummary: ${result.summary}`
        )
        .join('\n\n');
      return formattedResults;
    } catch (error) {
      console.error('Error fetching search results:', error);
      return 'An error occurred while searching.';
    }
  };

  // DeepChat configuration
  const deepChatConfig = {
    // Configure DeepChat properties here
    placeholder: 'Type your message...',
    onSend: handleDeepChatMessage,
    customButtons: [
      {
        label: hasSummarized ? 'Save Page' : 'Summarize Page',
        onClick: hasSummarized ? saveSummary : sendPageForSummary,
      },
    ],
  };

  return (
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
          position: 'fixed', // Keep the logo fixed
          top: 0,
          left: 0,
          zIndex: 1000,
        }}
      />

      <AuthGuard>
        {/* The DeepChat window */}
        <Box
          sx={{
            width: '100%',
            marginTop: '100px', // Adjust margin to prevent overlap with fixed logo
          }}
        >
          <DeepChat {...deepChatConfig} />
        </Box>
      </AuthGuard>
    </Box>
  );
};

export default App;
