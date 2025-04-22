type Props = {
  count: number;
};

export default function NotificationIndicator({ count }: Props) {
  return (
    <div className="bg-red absolute -top-1 -right-1 flex aspect-square h-4 items-center justify-center rounded-full p-1 text-xs text-white">
      <span>{count}</span>
    </div>
  );
}
