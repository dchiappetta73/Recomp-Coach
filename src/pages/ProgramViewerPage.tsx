import PageSection from "../components/shared/PageSection";

const styles = {
  stateText: {
    color: "#cbd5e1",
    lineHeight: 1.6,
  },
} as const;

export default function ProgramViewerPage() {
  return (
    <PageSection title="Program Viewer">
      <p style={styles.stateText}>
        Claude-generated plans will be displayed here. This page will not generate workouts or make progression decisions.
      </p>
    </PageSection>
  );
}
