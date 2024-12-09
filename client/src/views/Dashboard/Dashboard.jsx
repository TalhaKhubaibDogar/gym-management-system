"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
    FormControl,
    MenuItem,
    Select,
    Checkbox,
    FormGroup,
    FormControlLabel,
    Grid,
} from "@mui/material";
import { BASE_URL, headers } from "@/helper/CONST";
import axios from "axios";

export default function Dashboard() {
    const [show, setShow] = useState(false);
    const router = useRouter();
    const [isAuthChecked, setIsAuthChecked] = useState(false);

    const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user")) : null;

    useEffect(() => {
        const checkAuth = () => {
            if (!user) {
                router.push("/login");
            } else {
                setIsAuthChecked(true);
                if (user && user.is_new) {
                    setShow(true);
                }
            }
        };
        checkAuth();
    }, [router, user]);

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        age: "",
        gender: "Male",
        height: "",
        weight: "",
        target_weight: "",
        gym_experience_level: "Beginner (0-1 years of training)",
        workout_frequency: "Rarely (1-2 times/week)",
        fitness_goals: [],
        preferred_workout_types: [],
        medical_conditions: ["None"],
        dietary_restrictions: ["None"],
        injury_status: {
            has_injury: false,
            injury_description: "",
        },
        workout_availability: {
            preferred_time: "",
            available_days: [],
            session_duration: 30,
        },
        preferred_training_split: "",
        bench_press_max: "",
        squat_max: "",
        deadlift_max: "",
    });

    const fitnessGoalsOptions = [
        "Weight Loss",
        "Muscle Gain",
        "Strength Training",
        "Endurance",
        "Flexibility",
        "General Fitness",
    ];

    const workoutTypesOptions = [
        "Strength Training (weights and resistance)",
        "HIIT (High Intensity Interval Training)",
        "Cardio (endurance focused)",
        "CrossFit (varied functional movements)",
        "Yoga (flexibility and mindfulness)",
        "Calisthenics (bodyweight exercises)",
    ];

    const availableDaysOptions = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleArrayChange = (e, field) => {
        const { value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [field]: typeof value === "string" ? value.split(",") : value, // Ensure it works for multiple selections
        }));
    };

    const handleNestedChange = (e, path) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [path]: {
                ...prev[path],
                [name]: value,
            },
        }));
    };

    const handleCheckboxChange = (e, path) => {
        const { checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [path]: {
                ...prev[path],
                has_injury: checked,
            },
        }));
    };

    const transformDataForAPI = (data) => ({
        ...data,
        workout_availability: {
            ...data.workout_availability,
            session_duration: Math.max(data.workout_availability.session_duration, 30),
        },
    });

    const handleSubmit = async () => {
        const transformedData = transformDataForAPI(formData);
        try {
            const response = await axios.put(`${BASE_URL}/api/v1/auth/profile`, transformedData, {
                headers: headers(),
            });
            alert("Profile updated successfully!");
            setShow(false);
            localStorage.setItem("user", JSON.stringify({ ...user, is_new: false }));
        } catch (error) {
            alert(error.response?.data?.message || "Failed to update profile.");
        }
    };

    if (!isAuthChecked) return <div>Loading...</div>;

    const modalStyle = {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "90%",
        maxWidth: "600px",
        maxHeight: "80vh",
        bgcolor: "background.paper",
        borderRadius: "8px",
        boxShadow: 24,
        overflowY: "auto",
        p: 4,
    };

    return (
        <section>
            <div className="container mt-5">

                {/* <Button variant="contained" onClick={() => setShow(true)}>
                    Open Modal
                </Button> */}

                <Modal open={show} onClose={() => setShow(false)}>
                    <Box sx={modalStyle}>
                        <Typography variant="h5" mb={2}>
                            Input Data
                        </Typography>
                        <form>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth label="First Name" name="first_name" value={formData.first_name} onChange={handleInputChange} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth label="Last Name" name="last_name" value={formData.last_name} onChange={handleInputChange} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth label="Age" type="number" name="age" value={formData.age} onChange={handleInputChange} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <Select name="gender" value={formData.gender} onChange={handleInputChange}>
                                            <MenuItem value="Male">Male</MenuItem>
                                            <MenuItem value="Female">Female</MenuItem>
                                            <MenuItem value="Other">Other</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <Select
                                            multiple
                                            name="fitness_goals"
                                            value={formData.fitness_goals}
                                            onChange={(e) => handleArrayChange(e, "fitness_goals")}
                                            renderValue={(selected) => selected.join(", ")} // Display selected items
                                        >
                                            {fitnessGoalsOptions.map((goal, index) => (
                                                <MenuItem key={index} value={goal}>
                                                    {goal}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <Select multiple name="preferred_workout_types" value={formData.preferred_workout_types} onChange={(e) => handleArrayChange(e, "preferred_workout_types")}>
                                            {workoutTypesOptions.map((type, index) => (
                                                <MenuItem key={index} value={type}>
                                                    {type}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField fullWidth label="Medical Conditions" name="medical_conditions" value={formData.medical_conditions[0]} onChange={(e) => handleArrayChange(e, "medical_conditions")} />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField fullWidth label="Dietary Restrictions" name="dietary_restrictions" value={formData.dietary_restrictions[0]} onChange={(e) => handleArrayChange(e, "dietary_restrictions")} />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormGroup>
                                        <FormControlLabel
                                            control={<Checkbox checked={formData.injury_status.has_injury} onChange={(e) => handleCheckboxChange(e, "injury_status")} />}
                                            label="Do you have an injury?"
                                        />
                                        {formData.injury_status.has_injury && (
                                            <TextField fullWidth label="Injury Description" name="injury_description" value={formData.injury_status.injury_description} onChange={(e) => handleNestedChange(e, "injury_status")} />
                                        )}
                                    </FormGroup>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField fullWidth label="Preferred Time" name="preferred_time" value={formData.workout_availability.preferred_time} onChange={(e) => handleNestedChange(e, "workout_availability")} />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <Select
                                            multiple
                                            name="available_days"
                                            value={formData.workout_availability.available_days}
                                            onChange={(e) => handleArrayChange(e, "workout_availability.available_days")}
                                            renderValue={(selected) => selected.join(", ")}
                                        >
                                            {availableDaysOptions.map((day, index) => (
                                                <MenuItem key={index} value={day}>
                                                    <Checkbox
                                                        checked={formData.workout_availability.available_days.includes(day)}
                                                    />
                                                    {day}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField fullWidth label="Session Duration (minutes)" type="number" name="session_duration" value={formData.workout_availability.session_duration} onChange={(e) => handleNestedChange(e, "workout_availability")} />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField fullWidth label="Preferred Training Split" name="preferred_training_split" value={formData.preferred_training_split} onChange={handleInputChange} />
                                </Grid>
                                <Grid item xs={12} >
                                    <TextField fullWidth label="Bench Press Max (kg)" type="number" name="bench_press_max" value={formData.bench_press_max} onChange={handleInputChange} />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField fullWidth label="Squat Max (kg)" type="number" name="squat_max" value={formData.squat_max} onChange={handleInputChange} />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField fullWidth label="Deadlift Max (kg)" type="number" name="deadlift_max" value={formData.deadlift_max} onChange={handleInputChange} />
                                </Grid>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Height (cm)"
                                    type="number"
                                    name="height"
                                    value={formData.height}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Weight (kg)"
                                    type="number"
                                    name="weight"
                                    value={formData.weight}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Target Weight (kg)"
                                    type="number"
                                    name="target_weight"
                                    value={formData.target_weight}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                            <Grid item xs={12} >
                                <FormControl fullWidth>
                                    <Select
                                        name="gym_experience_level"
                                        value={formData.gym_experience_level}
                                        onChange={handleInputChange}
                                    >
                                        <MenuItem value="Beginner (0-1 years of training)">Beginner (0-1 years of training)</MenuItem>
                                        <MenuItem value="Intermediate (1-3 years of training)">Intermediate (1-3 years of training)</MenuItem>
                                        <MenuItem value="Advanced (3+ years of training)">Advanced (3+ years of training)</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} >
                                <FormControl fullWidth>
                                    <Select
                                        name="workout_frequency"
                                        value={formData.workout_frequency}
                                        onChange={handleInputChange}
                                    >
                                        <MenuItem value="Rarely (1-2 times/week)">Rarely (1-2 times/week)</MenuItem>
                                        <MenuItem value="Occasionally (3-4 times/week)">Occasionally (3-4 times/week)</MenuItem>
                                        <MenuItem value="Regularly (5-6 times/week)">Regularly (5-6 times/week)</MenuItem>
                                        <MenuItem value="Daily (7 times/week)">Daily (7 times/week)</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Box mt={2} display="flex" justifyContent="space-between">
                                <Button variant="outlined" onClick={() => setShow(false)}>
                                    Close
                                </Button>
                                <Button variant="contained" onClick={handleSubmit}>
                                    Submit
                                </Button>
                            </Box>
                        </form>
                    </Box>
                </Modal>
            </div>
        </section>
    );
}
