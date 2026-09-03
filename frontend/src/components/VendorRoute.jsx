import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getVendorStatus } from "../api/vendorApi";

const VendorRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [vendorStatus, setVendorStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (!user) {
      setLoading(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const data = await getVendorStatus();
        if (isMounted) {
          setVendorStatus(data);
        }
      } catch (error) {
        console.error("Failed to check vendor status:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkStatus();

    return () => {
      isMounted = false;
    };
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Checking vendor authorization...</div>;
  }

  if (!vendorStatus || vendorStatus.status !== "APPROVED") {
    return <Navigate to="/become-a-baker" replace />;
  }

  return children;
};

export default VendorRoute;
