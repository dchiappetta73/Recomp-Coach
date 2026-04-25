import PageSection from "../components/shared/PageSection";

const styles = {
  stateText: {
    color: "#cbd5e1",
    lineHeight: 1.6,
  },
} as const;

export default function PhotosPage() {
  return (
    <PageSection title="Photos">
      <p style={styles.stateText}>
        Weekly photo entry will live here: photos taken, assessment date, and photo notes.
      </p>
    </PageSection>
  );
}
