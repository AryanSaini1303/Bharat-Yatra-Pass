'use client'
import styles from "./page.module.css";
import { Noto_Sans } from "next/font/google";
import { useSession, signOut } from "next-auth/react";

const notoSans = Noto_Sans({
  weight: "400",
  subsets: ["latin"],
});


export default function Home(){
    const { data: session, status } = useSession();
    if(status=='loading') return <div>Loading...</div>
    if(status=='unauthenticated') return <div>Unauthenticated...</div>
    return(
        <div><h1>{session?.user?.name}</h1> <button onClick={()=>{signOut({callbackUrl:"/"})}}>Sign out</button></div>
    )
}