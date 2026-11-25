const SERVER_URL = 'http://localhost:5000';

// A small helper to check the response and show useful server errors.
const checkResponse = async (response) => {
    if (!response.ok) {
        let message = `Request failed (${response.status})`;

        try {
            const errorData = await response.json();
            if (errorData.message) {
                message = errorData.message;
            }
        } catch {
            // The response may not contain JSON.
        }

        throw new Error(message);
    }

    // DELETE returns status 204, which has no response body.
    if (response.status === 204) {
        return null;
    }

    return response.json();
};


// login api
export const loginUser = async (email, password) => {
    const response = await fetch(`${SERVER_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    return checkResponse(response);
};