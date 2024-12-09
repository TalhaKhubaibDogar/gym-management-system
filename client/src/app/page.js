"use client";
import Dashboard from "@/views/Dashboard/Dashboard";

export default function Home() {

  return (
    <section
      className="container"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: "20px",
      }}
    >
      <div
        style={{
          textAlign: "center",
          backgroundColor: "#ffffff",
          padding: "30px",
          borderRadius: "15px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <p style={{ marginBottom: "20px", color: "#333", fontSize: '48px', fontWeight: 'bold' }}>Welcome to Dashboard</p>

        <div style={{ marginTop: "30px", width: "100%" }}>
          <Dashboard />
        </div>
      </div>
    </section>
  );
}
