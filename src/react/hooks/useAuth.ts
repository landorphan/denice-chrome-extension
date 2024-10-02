// src/react/hooks/useAuth.ts

import { useState, useEffect } from 'react';
import { checkAuthStatus } from '../services/authService';  // Import the authService

/**
 * Custom hook to manage user authentication status.
 * @returns {Object} - The current authentication status and a function to manually refresh it.
 */
const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    // Function to check the authentication status
    const refreshAuthStatus = async () => {
        const loggedIn = await checkAuthStatus();
        setIsAuthenticated(loggedIn);
    };

    useEffect(() => {
        // Check the auth status when the hook is first mounted
        refreshAuthStatus();
    }, []);

    return {
        isAuthenticated,
        refreshAuthStatus,
    };
};

export default useAuth;
