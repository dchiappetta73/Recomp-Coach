import type { ReactNode } from "react";

type PageSectionProps = {
  title: string;
  children: ReactNode;
};

export default function PageSection({ title, children }: PageSectionProps) {
  return (
    <section
      style={{
        color: "#e2e8f0",
        textAlign: "left",
        width: "100%",
      }}
    >
      <h2
        style={{
          color: "#e2e8f0",
          marginTop: 0,
          marginBottom: "24px",
        }}
      >
        {title}
      </h2>
      <div style={{ color: "#e2e8f0" }}>{children}</div>
    </section>
  );
}
