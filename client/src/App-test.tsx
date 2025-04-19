function AppTest() {
  // Use static HTML without any React features
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column", 
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f3f4f6",
      padding: "1rem"
    }}>
      <div style={{
        backgroundColor: "#ffffff",
        borderRadius: "0.5rem",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        padding: "2rem",
        maxWidth: "28rem",
        width: "100%"
      }}>
        <h1 style={{
          fontSize: "1.5rem",
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: "1.5rem",
          color: "#2563eb"
        }}>PotLock Minimal Test Page</h1>
        
        <p style={{
          marginBottom: "1rem",
          color: "#4b5563"
        }}>
          If you can see this page, the application is loading correctly.
        </p>
        
        <div style={{
          marginBottom: "1rem",
          padding: "1rem",
          backgroundColor: "#d1fae5",
          color: "#065f46",
          borderRadius: "0.375rem"
        }}>
          ✓ Basic React rendering is working
        </div>
        
        <button 
          style={{
            width: "100%",
            padding: "0.5rem 1rem",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            fontWeight: "600",
            borderRadius: "0.375rem",
            border: "none",
            cursor: "pointer"
          }}
          onClick={() => alert("Button clicked!")}
        >
          Test Button
        </button>
      </div>
    </div>
  );
}

export default AppTest;