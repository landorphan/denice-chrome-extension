// /src/react/services/authService.ts

const apiHost = process.env.API_HOST || 'http://localhost:3000'; // Default API host

/**
 * Checks if the user is authenticated by performing a HEAD request.
 * @returns {Promise<boolean>} - A promise that resolves to true if the user is authenticated, false otherwise.
 */
export const checkAuthStatus = async (): Promise<boolean> => {
    try {
        const response = await fetch(`${apiHost}/api/denice`, {
            method: 'GET',
            credentials: 'include', // Include cookies in the request
        });

        // If response is OK, assume the user is authenticated
        return response.ok;
    } catch (error) {
        console.error('Error checking authentication status:', error);
        return false;
    }
};
