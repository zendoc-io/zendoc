export type ToggleSwitchProps = {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
};

export default function ToggleSwitch({
  checked = false,
  onChange,
  disabled = false,
}: ToggleSwitchProps) {
  return (
    <button
      type="button"
      className={`
        relative h-6 w-12 rounded-full transition-colors duration-200
        ${checked ? "bg-primary" : "bg-gray-600"}
        ${disabled && "cursor-not-allowed opacity-50"}
      `}
      onClick={() => !disabled && onChange?.(!checked)}
      disabled={disabled}
    >
      <span
        className={`
          absolute top-1 h-4 w-4 rounded-full bg-white
          transition-transform duration-200
          ${checked ? "left-7" : "left-1"}
        `}
      />
    </button>
  );
}
