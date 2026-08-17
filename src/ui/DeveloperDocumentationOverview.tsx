import type { ReactNode } from "react";

type DeveloperDocumentationOverviewProps = {
  title: string;
  children: ReactNode;
};

export function DeveloperDocumentationOverview({
  title,
  children,
}: DeveloperDocumentationOverviewProps) {
  return (
    <header>
      <h1 className="text-3xl font-bold mb-6 text-gray-900">{title}</h1>
      <div className="text-gray-600 mb-8">{children}</div>
    </header>
  );
}
