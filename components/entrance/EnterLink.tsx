"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "@/app/entrance.module.css";

export default function EnterLink() {
  const router = useRouter();
  const pending = useRef(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => () => {
    if (timeout.current) clearTimeout(timeout.current);
  }, []);

  return (
    <Link
      className={styles.enter}
      data-leaving={leaving}
      href="/home"
      aria-label="Enter ENCARA homepage"
      aria-disabled={leaving || undefined}
      onNavigate={(event) => {
        event.preventDefault();
        if (pending.current) return;
        pending.current = true;
        setLeaving(true);
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        // Fade only the entrance text. The shared video never leaves the DOM.
        timeout.current = setTimeout(() => router.push("/home"), reduced ? 0 : 400);
      }}
    >
      ENTER
    </Link>
  );
}
