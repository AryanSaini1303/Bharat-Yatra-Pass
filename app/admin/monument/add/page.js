"use client";

import Loader from "@/components/loader";
import { supabase } from "@/lib/supabaseClient";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "@/app/admin/page.module.css";
import Navbar from "@/components/Navbar";
import AddMonumentForm from "@/components/AddMonumentForm";

export default function AdminUserPage() {
  const authorizedUsers =
    process.env.NEXT_PUBLIC_AUTHORIZED_EMAILS?.split(",") || []; // change this in page.js in home folder too if adding or removing authorized users, the one on the home page controls the redirection to this page and this one controls the access to this page
  const [user, setUser] = useState();
  const router = useRouter();
  const [loadingUser, setLoadingUser] = useState(true);
  const pathName = usePathname();

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/"); // Redirect after successful sign-out
    } catch (err) {
      console.error("Error signing out:", err.message);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      //   console.log(user);
      setUser(user);
      setLoadingUser(false);
    };
    fetchUser();
  }, []);

  if (loadingUser) {
    return <Loader margin={"15rem auto"} />;
  } else if (!user || !authorizedUsers.includes(user.email)) {
    return <p>Unauthorized</p>;
  }

  return (
    <div className="wrapper">
      <header className={styles.header}>
        <h1>Dashboard</h1>
        <button onClick={signOut}>Sign Out</button>
      </header>
      <section className={styles.container}>
        <Navbar pathName={pathName} />
        <section className={styles.content}>
          <AddMonumentForm />
        </section>
      </section>
    </div>
  );
}
