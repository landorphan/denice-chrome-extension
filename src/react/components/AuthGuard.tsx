import React from 'react';
import { Box, Button } from '@mui/material';
import useAuth from '../hooks/useAuth';  // Import the custom auth hook

interface AuthGuardProps {
    children: React.ReactNode;
}

/**
 * AuthGuard component that checks if the user is authenticated and renders the login button if not.
 * Otherwise, it renders the provided children.
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const { isAuthenticated, refreshAuthStatus } = useAuth();

    const handleLogin = () => {
        chrome.runtime.sendMessage({ action: 'login' });
    };

    if (isAuthenticated === null) {
        return null; // Loading state
    }

    if (!isAuthenticated) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                }}
            >
                <Button variant="contained" color="primary" onClick={handleLogin}>
                    Login
                </Button>
            </Box>
        );
    }

    // If authenticated, render the children components
    return <>{children}</>;
};

export default AuthGuard;
