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

export const createPost = async (formData) => {
    const response = await fetch(`${SERVER_URL}/api/post/create`, {
        method: 'POST',
        body: formData
    });

    return checkResponse(response);
};

export const getCurrentUser = async () => {
    const response = await fetch(`${SERVER_URL}/api/auth/me`);
    return checkResponse(response);
};

export const getPosts = async () => {
    const response = await fetch(`${SERVER_URL}/api/posts`);
    return checkResponse(response);
};

export const getPostById = async (postId) => {
    const response = await fetch(`${SERVER_URL}/api/posts/${postId}`);
    return checkResponse(response);
};

export const getComments = async (postId) => {
    const response = await fetch(`${SERVER_URL}/api/posts/${postId}/comments`);
    return checkResponse(response);
};

export const createComment = async (postId, content, parentComment = null) => {
    const response = await fetch(`${SERVER_URL}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content, parentComment })
    });

    return checkResponse(response);
};

export const updateComment = async (commentId, content) => {
    const response = await fetch(`${SERVER_URL}/api/comments/${commentId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
    });

    return checkResponse(response);
};

export const deleteComment = async (commentId) => {
    const response = await fetch(`${SERVER_URL}/api/comments/${commentId}`, {
        method: 'DELETE'
    });

    return checkResponse(response);
};