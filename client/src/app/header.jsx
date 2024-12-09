"use client";
import { useRouter } from "next/navigation";
import { Button } from "@mui/material";
import { useEffect, useState } from "react";

export default function Header() {
    const [user, setUser] = useState(null);
    const router = useRouter();

    // Ensure the component is rendered on the client side
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            router.push("/login"); // Redirect to login if no user is found
        }
    }, [router]); // Add router dependency to ensure it's always checked

    const handleCreateMembership = () => {
        router.push("/membership");
    };

    const handleViewUser = () => {
        router.push("/users");
    };

    const handleViewUserDetails = () => {
        router.push("/user-details"); // Adjust the route for user details as needed
    };

    const handleViewUserSubscription = () => {
        router.push("/user-subscription"); // Adjust the route for user subscription as needed
    };

    const handleLogout = () => {
        localStorage.clear(); // Clear all local storage
        router.push("/login"); // Redirect to the login page
        window.location.reload(); // Reload the page to reset state and ensure a fresh start
    };

    if (!user) {
        return null; // Prevent rendering the header while redirecting
    }

    return (
        <header
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 20px",
                backgroundColor: "#f5f5f5",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
        >
            {user?.is_superuser ? (
                // Show for superuser
                <div style={{ display: "flex", gap: "10px" }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleCreateMembership}
                        sx={{
                            padding: "10px 20px",
                            fontSize: "16px",
                            borderRadius: "10px",
                        }}
                    >
                        View Memberships
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleViewUser}
                        sx={{
                            padding: "10px 20px",
                            fontSize: "16px",
                            borderRadius: "10px",
                        }}
                    >
                        View Users
                    </Button>
                </div>
            ) : (
                // Show for non-superuser
                <div style={{ display: "flex", gap: "10px" }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleViewUserDetails}
                        sx={{
                            padding: "10px 20px",
                            fontSize: "16px",
                            borderRadius: "10px",
                        }}
                    >
                        User Details
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleViewUserSubscription}
                        sx={{
                            padding: "10px 20px",
                            fontSize: "16px",
                            borderRadius: "10px",
                        }}
                    >
                        User Subscription
                    </Button>
                </div>
            )}
            <Button
                variant="contained"
                color="secondary"
                onClick={handleLogout}
                sx={{
                    padding: "10px 20px",
                    fontSize: "16px",
                    borderRadius: "10px",
                }}
            >
                Logout
            </Button>
        </header>
    );
}
