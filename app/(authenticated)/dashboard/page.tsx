"use client";
import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";

// Context
import { useAuth } from "../../../contexts/AuthContext";

// Components
import { DashboardAside } from "../../../components/dashboard/DashboardAside";
import ImageGallery from "../../../components/dashboard/ImageGallery";

function Dashboard() {
  const [refreshFlag, setRefreshFlag] = React.useState(false);

  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/"); // redireciona para a home apenas se carregou e não tem user
    }
  }, [user, loading]);
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
      <div className="flex-grow md">
        <DashboardAside />
        <div className="min-[768px]:pl-64">
          <ImageGallery refreshFlag={refreshFlag} />
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
