// app/(authenticated)/dashboard/page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";

// Context
import { useAuth } from "../../../contexts/AuthContext";

// Components
import { DashboardAside } from "../../../components/dashboard/DashboardAside";
import ProductList from "@/components/dashboard/ProductList";

function Dashboard() {
  const [refreshFlag, setRefreshFlag] = React.useState(false);

  const { user, loading } = useAuth();
  const router = useRouter();

  // This line is correct, just needs the env variable to be properly inlined.
  const adminRole = Number(process.env.NEXT_PUBLIC_ROLE_ADMIN);

  React.useEffect(() => {
    // Add these logs to confirm the values are correct
    console.log("User from AuthContext:", user);
    console.log("Loading state:", loading);
    console.log("Admin Role (from env):", adminRole);

    if (!loading) {
      if (!user || user.role !== adminRole) {
        console.log("User not admin or not logged in, redirecting to /");
        router.push("/");
      } else {
        console.log("User is admin, allowing access.");
      }
    }
  }, [user, loading, adminRole, router]);

  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center">
        <p className="text-center font-bold uppercase">Carregando...</p>
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen">
      <div className="flex-grow">
        <DashboardAside />
        <ProductList/>
      </div>
    </main>
  );
}

export default Dashboard;
