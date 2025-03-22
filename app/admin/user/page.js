"use client";

import Loader from "@/components/loader";
import { supabase } from "@/lib/supabaseClient";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "../page.module.css";
import Navbar from "@/components/Navbar";

export default function AdminPage() {
  const authorizedUsers = ["210160223018.aryan@gdgu.org"]; // change this in page.js in home folder too if adding or removing authorized users, the one on the home page controls the redirection to this page and this one controls the access to this page
  const [user, setUser] = useState();
  const router = useRouter();
  const [loadingUser, setLoadingUser] = useState(true);
  const pathName = usePathname();
  console.log(pathName);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
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
      <h1 style={{ textAlign: "center" }}>Dashboard</h1>
      <section className={styles.container}>
        <Navbar pathName={pathName} />
        <section className={styles.content}></section>
      </section>
    </div>
  );
}
