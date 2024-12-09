"use client";
import {
    Button,
    Card,
    CardContent,
    Typography,
    Grid,
    Box,
    Modal,
    Backdrop,
    Fade,
    TextField,
    useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL, headers } from "@/helper/CONST";

export default function Membership() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedMembership, setSelectedMembership] = useState(null);
    const [openViewModal, setOpenViewModal] = useState(false);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user")) : null;

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

    const [newMembership, setNewMembership] = useState({
        name: "",
        description: "",
        price: 0.0,
        duration_months: 0,
        benefits: [""],
    });

    const handleGetData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/api/v1/admin/memberships`, {
                headers: headers(),
            });
            setData(response.data);
        } catch (error) {
            console.error(error);
            alert("Failed to fetch memberships. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenViewModal = (membership) => {
        setSelectedMembership(membership);
        setOpenViewModal(true);
    };

    const handleCloseViewModal = () => {
        setOpenViewModal(false);
        setSelectedMembership(null);
    };

    const handleOpenAddModal = () => {
        setIsEditMode(false); // Add mode
        setOpenAddModal(true);
    };

    const handleOpenEditModal = () => {
        if (selectedMembership) {
            setNewMembership({ ...selectedMembership });
            setIsEditMode(true); // Edit mode
            setOpenViewModal(false);
            setOpenAddModal(true);
        }
    };

    const handleCloseAddModal = () => {
        setOpenAddModal(false);
        setNewMembership({
            name: "",
            description: "",
            price: 0.0,
            duration_months: 0,
            benefits: [""],
        });
    };

    const handleNewMembershipChange = (field, value) => {
        setNewMembership((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleAddBenefit = () => {
        setNewMembership((prev) => ({
            ...prev,
            benefits: [...prev.benefits, ""],
        }));
    };

    const handleBenefitChange = (index, value) => {
        setNewMembership((prev) => {
            const benefits = [...prev.benefits];
            benefits[index] = value;
            return { ...prev, benefits };
        });
    };

    const handleSubmitMembership = async () => {
        try {
            if (isEditMode) {
                // Update membership
                await axios.put(`${BASE_URL}/api/v1/admin/memberships/${newMembership.id}`, newMembership, {
                    headers: headers(),
                });
                alert("Membership updated successfully!");
            } else {
                // Add new membership
                await axios.post(`${BASE_URL}/api/v1/admin/memberships`, newMembership, {
                    headers: headers(),
                });
                alert("Membership added successfully!");
            }
            handleCloseAddModal();
            handleGetData();
        } catch (error) {
            console.error(error);
            alert(isEditMode ? "Failed to update membership." : "Failed to add membership.");
        }
    };

    const handleDeleteMembership = async () => {
        if (selectedMembership) {
            const confirmDelete = window.confirm("Are you sure you want to delete this membership?");
            if (!confirmDelete) return;

            try {
                await axios.delete(`${BASE_URL}/api/v1/admin/memberships/${selectedMembership.id}`, {
                    headers: headers(),
                });
                alert("Membership deleted successfully!");
                handleCloseViewModal();
                handleGetData();
            } catch (error) {
                console.error(error);
                alert("Failed to delete membership. Please try again.");
            }
        }
    };

    useEffect(() => {
        handleGetData();
    }, []);

    return (
        <section className="container">
            <Box
                display="flex"
                justifyContent={isSmallScreen ? "center" : "space-between"}
                alignItems="center"
                flexDirection={isSmallScreen ? "column" : "row"}
                mt={2}
                mb={4}
            >
                <Typography
                    variant="h4"
                    fontWeight="bold"
                    textAlign={isSmallScreen ? "center" : "left"}
                    mb={isSmallScreen ? 2 : 0}
                >
                    Membership Plans
                </Typography>
                {/* Add Membership Button */}
                {user?.is_superuser && (
                    <Button variant="contained" color="primary" onClick={handleOpenAddModal}>
                        Add Membership
                    </Button>
                )}

            </Box>

            {loading ? (
                <Typography variant="h6" align="center" mt={2}>
                    Loading...
                </Typography>
            ) : (
                <Grid container spacing={isSmallScreen ? 2 : 4}>
                    {data.map((membership) => (
                        <Grid item xs={12} sm={6} md={4} key={membership.id}>
                            <Card
                                onClick={() => handleOpenViewModal(membership)}
                                sx={{
                                    borderRadius: "16px",
                                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                                    transition: "transform 0.3s ease-in-out",
                                    "&:hover": { transform: "scale(1.05)", cursor: "pointer" },
                                }}
                            >
                                <CardContent>
                                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                                        {membership.name}
                                    </Typography>
                                    <Typography variant="body1" color="textSecondary" mb={2}>
                                        {membership.description}
                                    </Typography>
                                    <Typography variant="body2" color="textPrimary" fontWeight="bold" mt={1}>
                                        Price: ${membership.price.toFixed(2)}
                                    </Typography>
                                    <Typography variant="body2" color="textPrimary" fontWeight="bold">
                                        Duration: {membership.duration_months} months
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* View Membership Modal */}
            {/* View Membership Modal */}
            <Modal
                open={openViewModal}
                onClose={handleCloseViewModal}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{ timeout: 500 }}
            >
                <Fade in={openViewModal}>
                    <Box
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            bgcolor: "background.paper",
                            boxShadow: 24,
                            p: isSmallScreen ? 2 : 4,
                            borderRadius: 2,
                            maxWidth: isSmallScreen ? "90%" : 500,
                            width: "100%",
                        }}
                    >
                        {selectedMembership && (
                            <>
                                <Typography variant="h4" gutterBottom>
                                    {selectedMembership.name}
                                </Typography>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <TextField
                                        fullWidth
                                        label="Membership ID"
                                        value={selectedMembership.id}
                                        InputProps={{
                                            readOnly: true,
                                        }}
                                        margin="normal"
                                    />
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => {
                                            navigator.clipboard.writeText(selectedMembership.id);
                                            alert("Membership ID copied to clipboard!");
                                        }}
                                        sx={{ ml: 2, height: "56px" }} // Adjust height to match TextField
                                    >
                                        Copy
                                    </Button>
                                </Box>
                                <Typography variant="body1" color="textSecondary" mb={2}>
                                    {selectedMembership.description}
                                </Typography>
                                <Typography variant="body2" fontWeight="bold" mt={2}>
                                    Price: ${selectedMembership.price.toFixed(2)}
                                </Typography>
                                <Typography variant="body2" fontWeight="bold" mt={1}>
                                    Duration: {selectedMembership.duration_months} months
                                </Typography>
                                <Typography variant="body2" fontWeight="bold" mt={2}>
                                    Benefits:
                                </Typography>
                                <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
                                    {selectedMembership.benefits.map((benefit, index) => (
                                        <li key={index}>
                                            <Typography variant="body2">{benefit}</Typography>
                                        </li>
                                    ))}
                                </ul>
                                <Box mt={3}>
                                    {user?.is_superuser && (
                                        <>
                                            <Button
                                                variant="contained"
                                                color="secondary"
                                                fullWidth
                                                onClick={handleOpenEditModal}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="error"
                                                fullWidth
                                                onClick={handleDeleteMembership}
                                                sx={{ mt: 2 }}
                                            >
                                                Delete
                                            </Button>
                                        </>
                                    )}
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        onClick={handleCloseViewModal}
                                        sx={{ mt: 2 }}
                                    >
                                        Close
                                    </Button>
                                </Box>
                            </>
                        )}
                    </Box>
                </Fade>
            </Modal>

            {/* Add/Edit Membership Modal */}
            <Modal
                open={openAddModal}
                onClose={handleCloseAddModal}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{ timeout: 500 }}
            >
                <Fade in={openAddModal}>
                    <Box
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            bgcolor: "background.paper",
                            boxShadow: 24,
                            p: isSmallScreen ? 2 : 4,
                            borderRadius: 2,
                            maxWidth: isSmallScreen ? "90%" : 500,
                            width: "100%",
                            maxHeight: "90vh",
                            overflowY: "auto",
                        }}
                    >
                        {user?.is_superuser ? (
                            <>
                                <Typography variant="h4" gutterBottom>
                                    {isEditMode ? "Edit Membership" : "Add Membership"}
                                </Typography>
                                <TextField
                                    fullWidth
                                    label="Name"
                                    value={newMembership.name}
                                    onChange={(e) => handleNewMembershipChange("name", e.target.value)}
                                    margin="normal"
                                />
                                <TextField
                                    fullWidth
                                    label="Description"
                                    value={newMembership.description}
                                    onChange={(e) => handleNewMembershipChange("description", e.target.value)}
                                    margin="normal"
                                    multiline
                                    rows={4}
                                />
                                <TextField
                                    fullWidth
                                    label="Price"
                                    type="number"
                                    value={newMembership.price}
                                    onChange={(e) => handleNewMembershipChange("price", parseFloat(e.target.value))}
                                    margin="normal"
                                />
                                <TextField
                                    fullWidth
                                    label="Duration (Months)"
                                    type="number"
                                    value={newMembership.duration_months}
                                    onChange={(e) => handleNewMembershipChange("duration_months", parseInt(e.target.value, 10))}
                                    margin="normal"
                                />
                                <Typography variant="body2" mt={2} mb={1}>
                                    Benefits:
                                </Typography>
                                {newMembership.benefits.map((benefit, index) => (
                                    <TextField
                                        key={index}
                                        fullWidth
                                        label={`Benefit ${index + 1}`}
                                        value={benefit}
                                        onChange={(e) => handleBenefitChange(index, e.target.value)}
                                        margin="normal"
                                    />
                                ))}
                                <Button variant="outlined" onClick={handleAddBenefit} fullWidth>
                                    Add Another Benefit
                                </Button>
                                <Box mt={3}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        onClick={handleSubmitMembership}
                                    >
                                        {isEditMode ? "Update" : "Submit"}
                                    </Button>
                                </Box>
                            </>
                        ) : (
                            <Typography variant="h6" color="error">
                                You do not have the required permissions to add or edit memberships.
                            </Typography>
                        )}
                    </Box>
                </Fade>
            </Modal>

          
        </section>
    );
}
