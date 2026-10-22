import type { Metadata, Viewport } from "next";
import EnterLink from "@/components/entrance/EnterLink";
import styles from "./entrance.module.css";

export const metadata: Metadata = { title: { absolute: "Enter | ENCARA" } };
export const viewport: Viewport = { viewportFit: "cover" };

export default function Entrance() {
  return (
    <main className={styles.entrance} aria-label="ENCARA entrance">
      <EnterLink />
    </main>
  );
}
