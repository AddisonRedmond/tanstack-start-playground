import ReportBuilder from "#/components/report-client/report-parent.tsx";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <ReportBuilder />;
}
