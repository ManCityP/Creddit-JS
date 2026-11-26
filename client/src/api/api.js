export const SERVER_URL = 'http://localhost:5000';

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

        const error = new Error(message);
        error.status = response.status; 
        throw error;
    }

    // DELETE returns status 204, which has no response body.
    if (response.status === 204) {
        return null; //todo need to return a success message
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

export const createPost = async (formData) => {
    const response = await fetch(`${SERVER_URL}/api/post/create`, {
        method: 'POST',
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
