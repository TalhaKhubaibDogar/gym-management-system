// BASE_URL Constant
export const BASE_URL = process.env.HOST || "http://127.0.0.1:7000";

// export const BASE_URL = "http://127.0.0.1:7000";

// Standard JSON headers with Authorization
export const headers = () => {
    const storedValue = localStorage.getItem("user");
    const uuid = storedValue ? JSON.parse(storedValue) : null;
    return {
        "Content-Type": "application/json",
        Authorization: uuid ? uuid.IdToken : undefined,
    };
};
