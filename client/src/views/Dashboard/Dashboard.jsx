"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
    const router = useRouter();
    const [isAuthChecked, setIsAuthChecked] = useState(false); // State to track if auth is checked

    useEffect(() => {
        const checkAuth = async () => {
            const user = localStorage.getItem("user");

            if (!user) {
                router.push("/login");
            } else {
                setIsAuthChecked(true); // Auth check is completed
            }
        };

        checkAuth();
    }, [router]);

    // Show a loading state while checking authentication
    if (!isAuthChecked) {
        return <div>Loading...</div>;
    }

    return (
        <section>
            Hello World
        </section>
    );
}
