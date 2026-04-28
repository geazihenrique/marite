type ActionButtonProps = {
  label: string;
  hint?: string;
  icon: string;
  tone?: 'primary' | 'sleep' | 'wake' | 'neutral';
  onClick: () => void;
};

export function ActionButton({ label, hint, icon, tone = 'neutral', onClick }: ActionButtonProps) {
  return (
    <button className={`actionButton actionButton--${tone}`} type="button" onClick={onClick}>
      <span className="actionButton__icon" aria-hidden="true">
        {icon}
      </span>
      <span>
        <strong>{label}</strong>
        {hint ? <small>{hint}</small> : null}
      </span>
    </button>
  );
}
