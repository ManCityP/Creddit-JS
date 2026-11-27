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

// The login token saved by Login.jsx
export const isLoggedIn = () => Boolean(localStorage.getItem('token'));

const authHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
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

export const getCurrentUser = async () => {
    const response = await fetch(`${SERVER_URL}/api/auth/me`, {
        headers: authHeaders()
    });
    return checkResponse(response);
};


/* region Posts API */

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

export const fetchLatestPosts = async (limit = 10) => {
    const response = await fetch(`${SERVER_URL}/api/post/latest?limit=${limit}`, {
        headers: {
            ...authHeaders(),
        },
    });
    const data = await checkResponse(response);
    return Array.isArray(data) ? data : data?.posts || [];
};

export const getPosts = async () => {
    const response = await fetch(`${SERVER_URL}/api/posts`, {
        headers: authHeaders()
    });
    return checkResponse(response);
};

export const getPostById = async (postId) => {
    const response = await fetch(`${SERVER_URL}/api/posts/${postId}`, {
        headers: authHeaders()
    });
    return checkResponse(response);
};

export const votePost = async (postId, value) => {
    const response = await fetch(`${SERVER_URL}/api/post/${postId}/vote`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
        },
        body: JSON.stringify({ value }),
    });
    return checkResponse(response);
};

/* endregion */


/* region Comments API */

export const getComments = async (postId) => {
    const response = await fetch(`${SERVER_URL}/api/posts/${postId}/comments`, {
        headers: authHeaders()
    });
    return checkResponse(response);
};

export const createComment = async (postId, content, parentComment = null) => {
    const response = await fetch(`${SERVER_URL}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders()
        },
        body: JSON.stringify({ content, parentComment })
    });

    return checkResponse(response);
};

export const updateComment = async (commentId, content) => {
    const response = await fetch(`${SERVER_URL}/api/comments/${commentId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders()
        },
        body: JSON.stringify({ content })
    });

    return checkResponse(response);
};

export const deleteComment = async (commentId) => {
    const response = await fetch(`${SERVER_URL}/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: authHeaders()
    });

    return checkResponse(response);
};

/* endregion */


/* region Communities API */

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

/* endregion */
