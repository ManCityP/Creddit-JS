const API_URL = "http://localhost:5000/api/communities";

// Login isn't connected to the server yet. This assumes the login page
// will save the token in localStorage under "token". If it saves it
// somewhere else, only this function needs to change.
function getToken() {
    return localStorage.getItem("token");
}

export function isLoggedIn() {
    return Boolean(getToken());
}

// Sends a request to the server and returns the JSON answer.
// If the server answers with an error, it throws an Error with the server's message and the status code (err.status).

async function request(url, options = {}) {
    const headers = {};
    if (options.body) {
        headers["Content-Type"] = "application/json";
    }
    const token = getToken();
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    let response;
    try {
        response = await fetch(url, { ...options, headers });
    } catch {
        throw new Error("Can't reach the server. Make sure it's running.");
    }

    let data = null;
    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        const error = new Error(data?.message || "Something went wrong, please try again.");
        error.status = response.status;
        throw error;
    }

    return data;
}

export function createCommunity(name, description) {
    return request(API_URL, {
        method: "POST",
        body: JSON.stringify({ name, description })
    });
}

export function getCommunity(name) {
    return request(`${API_URL}/${encodeURIComponent(name)}`);
}
