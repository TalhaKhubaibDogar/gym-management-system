'use client';
import axios from "axios";
import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Modal,
    Box,
    Typography,
    Switch,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import { BASE_URL, headers } from "@/helper/CONST";

export default function Users() {
    const [data, setData] = useState([]); // List of users
    const [dataNew, setDataNew] = useState([]); // List of memberships
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [openSubscribeModal, setOpenSubscribeModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedMembershipId, setSelectedMembershipId] = useState(""); // For storing selected subscription ID

    const handleGetData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/api/v1/admin/users`, {
                headers: headers(),
            });
            setData(response.data);
        } catch (error) {
            console.error(error);
            alert("Failed to fetch Users. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubscriptionData = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/v1/admin/memberships`, {
                headers: headers(),
            });
            setDataNew(response.data); // Store the subscription data
        } catch (error) {
            console.error(error);
            alert("Failed to fetch memberships. Please try again.");
        }
    };

    const handleOpenModal = (user) => {
        setSelectedUser(user);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedUser(null);
    };

    const handleOpenSubscribeModal = (user) => {
        setSelectedUser(user);
        setOpenSubscribeModal(true);
    };

    const handleCloseSubscribeModal = () => {
        setOpenSubscribeModal(false);
        setSelectedMembershipId(""); // Clear the selected membership ID
        setSelectedUser(null);
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        try {
            await axios.put(
                `${BASE_URL}/api/v1/admin/users/${userId}`,
                { is_active: !currentStatus },
                { headers: headers() }
            );
            alert(`User status updated to ${!currentStatus ? "Active" : "Inactive"}.`);
            handleGetData();
        } catch (error) {
            console.error(error);
            alert("Failed to update user status. Please try again.");
        }
    };

    const handleSubscribeUser = async () => {
        if (!selectedMembershipId) {
            alert("Please select a Membership Plan.");
            return;
        }

        try {
            await axios.post(
                `${BASE_URL}/api/v1/admin/users/${selectedUser._id}/subscribe`,
                { membership_id: selectedMembershipId },
                { headers: headers() }
            );
            alert("User successfully subscribed to the plan!");
            handleCloseSubscribeModal();
        } catch (error) {
            console.error(error);
            alert("Failed to subscribe user. Please try again.");
        }
    };

    useEffect(() => {
        handleGetData();
        handleSubscriptionData();
    }, []);

    return (
        <section className="container">
            <Typography variant="h4" mb={3}>
                User List
            </Typography>

            {loading ? (
                <Typography variant="h6">Loading...</Typography>
            ) : (
                <Box sx={{ overflowX: "auto" }}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>First Name</TableCell>
                                    <TableCell>Last Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Subscribe</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.map((user) => (
                                    <TableRow key={user._id}>
                                        <TableCell>{user.first_name}</TableCell>
                                        <TableCell>{user.last_name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={user.is_active}
                                                onChange={() => toggleUserStatus(user._id, user.is_active)}
                                                color="primary"
                                            />
                                            {user.is_active ? "Active" : "Inactive"}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="contained"
                                                color="secondary"
                                                onClick={() => handleOpenSubscribeModal(user)}
                                                sx={{ ml: 2 }}
                                            >
                                                Subscribe Plan
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => handleOpenModal(user)}
                                            >
                                                View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {/* Modal for User Details */}
            <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="user-details-modal"
                aria-describedby="user-details-description"
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                        width: "90%",
                        maxWidth: 500,
                        maxHeight: "90vh",
                        overflowY: "auto",
                    }}
                >
                    {selectedUser && (
                        <>
                            <Typography id="user-details-modal" variant="h5" gutterBottom>
                                User Details
                            </Typography>
                            <Typography variant="body1">
                                <strong>ID:</strong> {selectedUser._id}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Name:</strong> {selectedUser.first_name} {selectedUser.last_name}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Email:</strong> {selectedUser.email}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Status:</strong> {selectedUser.is_active ? "Active" : "Inactive"}
                            </Typography>
                            <Box mt={3}>
                                <Button variant="contained" color="primary" fullWidth onClick={handleCloseModal}>
                                    Close
                                </Button>
                            </Box>
                        </>
                    )}
                </Box>
            </Modal>

            {/* Modal for Subscription */}
            <Modal
                open={openSubscribeModal}
                onClose={handleCloseSubscribeModal}
                aria-labelledby="subscribe-modal"
                aria-describedby="subscribe-description"
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                        width: "90%",
                        maxWidth: 500,
                        maxHeight: "90vh",
                        overflowY: "auto",
                    }}
                >
                    {selectedUser && (
                        <>
                            <Typography id="subscribe-modal" variant="h5" gutterBottom>
                                Subscribe Plan for {selectedUser.first_name} {selectedUser.last_name}
                            </Typography>
                            {/* Dropdown to select a subscription plan */}
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Membership Plan</InputLabel>
                                <Select
                                    value={selectedMembershipId}
                                    onChange={(e) => setSelectedMembershipId(e.target.value)}
                                    label="Membership Plan"
                                >
                                    {dataNew.map((membership) => (
                                        <MenuItem key={membership.id} value={membership.id}>
                                            {membership.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Box mt={3}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    onClick={handleSubscribeUser}
                                >
                                    Subscribe
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    fullWidth
                                    onClick={handleCloseSubscribeModal}
                                    sx={{ mt: 2 }}
                                >
                                    Cancel
                                </Button>
                            </Box>
                        </>
                    )}
                </Box>
            </Modal>
        </section>
    );
}
