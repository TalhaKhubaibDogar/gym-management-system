"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Typography, Box, Paper } from "@mui/material";
import { BASE_URL, headers } from "@/helper/CONST";

export default function UserSubscription() {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleGetSubscription = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/api/v1/auth/profile`, {
                headers: headers(),
            });
            setSubscription(response.data.membership);
        } catch (error) {
            console.error(error);
            alert("Failed to fetch subscription data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleGetSubscription();
    }, []);

    return (
        <section className="container">
            <Typography variant="h4" mb={3}>
                User Subscription
            </Typography>

            {loading ? (
                <Typography variant="h6">Loading...</Typography>
            ) : subscription ? (
                <Paper elevation={3} sx={{ padding: "20px", borderRadius: "10px" }}>
                    <Box sx={{ marginBottom: "20px" }}>
                        <Typography variant="h5" fontWeight="bold">
                            Subscription Details
                        </Typography>
                        <Typography>
                            <strong>Membership Name:</strong> {subscription.membership_name}
                        </Typography>
                        <Typography>
                            <strong>Description:</strong> {subscription.membership_description}
                        </Typography>
                        <Typography>
                            <strong>Price:</strong> ${subscription.price.toFixed(2)}
                        </Typography>
                        <Typography>
                            <strong>Start Date:</strong>{" "}
                            {new Date(subscription.start_date).toLocaleDateString()}
                        </Typography>
                        <Typography>
                            <strong>End Date:</strong>{" "}
                            {new Date(subscription.end_date).toLocaleDateString()}
                        </Typography>
                    </Box>
                </Paper>
            ) : (
                <Typography variant="h6" color="error">
                    No subscription data available.
                </Typography>
            )}
        </section>
    );
}
