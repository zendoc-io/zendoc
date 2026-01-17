import BaseButton from "../BaseButton";
import CheckmarkIcon from "@/../public/icons/checkmark.svg";
import XMarkIcon from "@/../public/icons/x-mark.svg";

type Props = {
  checked: boolean;
  text?: string;
  onChange: (checked: boolean) => void;
};

export default function ToggleButton({ checked, text, onChange }: Props) {
  return (
    <BaseButton
      type="icon"
      icon={
        checked ? (
          <CheckmarkIcon width={12} />
        ) : (
          <XMarkIcon width={12} className="text-gray-500" />
        )
      }
      className={`text-sm ${!checked && "text-gray-500"}`}
      onClick={() => onChange(!checked)}
    >
      {text}
    </BaseButton>
  );
}
