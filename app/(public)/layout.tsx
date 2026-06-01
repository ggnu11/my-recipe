import { SceneManager } from "@/components/SceneManager";
import { DataProvider } from "@/components/DataProvider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DataProvider>
        <SceneManager />
      </DataProvider>
      <div style={{ display: "none" }}>{children}</div>
    </>
  );
}
