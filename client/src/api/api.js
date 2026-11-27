export const SERVER_URL = 'http://localhost:5000';

// Retrieve the saved token.
export const getToken = () => {
    return localStorage.getItem("token");
};

// Retrieve the saved user information.
export const getStoredUser = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
};

// Clear login information.
export const logoutUser = async () => {
    const token = getToken();

    try {
        if (token) {
            const response = await fetch(`${SERVER_URL}/api/auth/logout`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            await checkResponse(response);
        }
    } finally {
        // Always clear local login information,
        // even if the server request fails.
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    }
};

// Check the response and show useful server errors.
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

        const error = new Error(message);
        error.status = response.status;
        throw error;
    }

    // DELETE returns status 204, which has no response body.
    if (response.status === 204) {
        return null;
    }

    return response.json();
};


// Login API
export const loginUser = async (email, password) => {
    const response = await fetch(`${SERVER_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    const data = await checkResponse(response);

    // Save the token and user information after successful login.
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    return data;
};


// Register API
export const registerUser = async (username, email, password) => {
    const response = await fetch(`${SERVER_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
    });

    return checkResponse(response);
};


// Create Post API
export const createPost = async (formData) => {
    const token = getToken();

    const response = await fetch(`${SERVER_URL}/api/post/create`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData
    });

    return checkResponse(response);
};



// The login token saved by Login.jsx
export const isLoggedIn = () => Boolean(localStorage.getItem('token'));

const authHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};



export const createCommunity = async (name, description) => {
    const response = await fetch(`${SERVER_URL}/api/communities`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders()
        },
        body: JSON.stringify({ name, description })
    });

    return checkResponse(response);
};

export const getCommunity = async (name) => {
    const response = await fetch(`${SERVER_URL}/api/communities/${encodeURIComponent(name)}`, {
        headers: authHeaders()
    });

    return checkResponse(response);
};

export const joinCommunity = async (name) => {
    const response = await fetch(`${SERVER_URL}/api/communities/${encodeURIComponent(name)}/join`, {
        method: 'POST',
        headers: authHeaders()
    });

    return checkResponse(response);
};

export const leaveCommunity = async (name) => {
    const response = await fetch(`${SERVER_URL}/api/communities/${encodeURIComponent(name)}/leave`, {
        method: 'POST',
        headers: authHeaders()
    });

    return checkResponse(response);
};
