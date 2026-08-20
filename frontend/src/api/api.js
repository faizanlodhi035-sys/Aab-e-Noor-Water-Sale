const API_BASE_URL = "http://127.0.0.1:8000/api";

export async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem("auth_token");

    const isFormData = options.body instanceof FormData;

    const headers = {
        "Accept": "application/json",
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(options.headers || {}),
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const text = await response.text();

    let data;

    try {
        data = text ? JSON.parse(text) : {};
    } catch (error) {
        console.error("Non-JSON API response:", text);

        throw new Error(
            `Server returned invalid JSON (${response.status}). Check Laravel backend.`
        );
    }

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            `API request failed (${response.status})`
        );
    }

    return data;
}

export async function login(login, password) {
    const data = await apiRequest("/login", {
        method: "POST",
        body: JSON.stringify({
            login,
            password,
        }),
    });

    if (data.success && data.data?.token) {
        localStorage.setItem("auth_token", data.data.token);

        localStorage.setItem(
            "auth_user",
            JSON.stringify(data.data.user)
        );
    }

    return data;
}

export async function logout() {
    try {
        await apiRequest("/logout", {
            method: "POST",
        });
    } finally {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
    }
}

export async function getCustomers() {
    return await apiRequest("/customers");
}