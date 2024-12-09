"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Typography, Box, Grid, Paper } from "@mui/material";
import { BASE_URL, headers } from "@/helper/CONST";

export default function UserDetail() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleGetData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/api/v1/auth/profile`, {
                headers: headers(),
            });
            setProfile(response.data.profile);
        } catch (error) {
            console.error(error);
            alert("Failed to fetch user profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleGetData();
    }, []);

    return (
        <section className="container">
            <Typography variant="h4" mb={3}>
                User Profile
            </Typography>

            {loading ? (
                <Typography variant="h6">Loading...</Typography>
            ) : (
                profile && (
                    <Paper elevation={3} sx={{ padding: "20px", borderRadius: "10px" }}>
                        <Box sx={{ marginBottom: "20px" }}>
                            <Typography variant="h5" fontWeight="bold">
                                Personal Information
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography>
                                        <strong>First Name:</strong> {profile.first_name}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography>
                                        <strong>Last Name:</strong> {profile.last_name}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography>
                                        <strong>Age:</strong> {profile.age}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography>
                                        <strong>Gender:</strong> {profile.gender}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>

                        <Box sx={{ marginBottom: "20px" }}>
                            <Typography variant="h5" fontWeight="bold">
                                Physical Stats
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <Typography>
                                        <strong>Height:</strong> {profile.height} cm
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography>
                                        <strong>Weight:</strong> {profile.weight} kg
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography>
                                        <strong>Target Weight:</strong> {profile.target_weight} kg
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>

                        <Box sx={{ marginBottom: "20px" }}>
                            <Typography variant="h5" fontWeight="bold">
                                Fitness Details
                            </Typography>
                            <Typography>
                                <strong>Experience Level:</strong> {profile.gym_experience_level}
                            </Typography>
                            <Typography>
                                <strong>Workout Frequency:</strong> {profile.workout_frequency}
                            </Typography>
                            <Typography>
                                <strong>Fitness Goals:</strong> {profile.fitness_goals.join(", ")}
                            </Typography>
                            <Typography>
                                <strong>Preferred Workout Types:</strong>{" "}
                                {profile.preferred_workout_types.join(", ")}
                            </Typography>
                        </Box>

                        <Box sx={{ marginBottom: "20px" }}>
                            <Typography variant="h5" fontWeight="bold">
                                Health Details
                            </Typography>
                            <Typography>
                                <strong>Medical Conditions:</strong> {profile.medical_conditions.join(", ")}
                            </Typography>
                            <Typography>
                                <strong>Dietary Restrictions:</strong> {profile.dietary_restrictions.join(", ")}
                            </Typography>
                            <Typography>
                                <strong>Injury Status:</strong> {profile.injury_status.has_injury ? "Yes" : "No"}
                            </Typography>
                            {profile.injury_status.has_injury && (
                                <Typography>
                                    <strong>Injury Description:</strong> {profile.injury_status.injury_description}
                                </Typography>
                            )}
                        </Box>

                        <Box sx={{ marginBottom: "20px" }}>
                            <Typography variant="h5" fontWeight="bold">
                                Workout Availability
                            </Typography>
                            <Typography>
                                <strong>Preferred Time:</strong> {profile.workout_availability.preferred_time}
                            </Typography>
                            <Typography>
                                <strong>Available Days:</strong>{" "}
                                {profile.workout_availability.available_days.join(", ")}
                            </Typography>
                            <Typography>
                                <strong>Session Duration:</strong>{" "}
                                {profile.workout_availability.session_duration} minutes
                            </Typography>
                        </Box>

                        <Box sx={{ marginBottom: "20px" }}>
                            <Typography variant="h5" fontWeight="bold">
                                Strength Stats
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <Typography>
                                        <strong>Bench Press Max:</strong> {profile.bench_press_max} kg
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography>
                                        <strong>Squat Max:</strong> {profile.squat_max} kg
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography>
                                        <strong>Deadlift Max:</strong> {profile.deadlift_max} kg
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                )
            )}
        </section>
    );
}
