type StatusCardProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
};

export function StatusCard({ eyebrow, title, subtitle }: StatusCardProps) {
  return (
    <section className="statusCard">
      <p>{eyebrow}</p>
      <h2>{title}</h2>
      {subtitle ? <span>{subtitle}</span> : null}
    </section>
  );
}
