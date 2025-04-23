type Props = {
  name: string;
  children: React.ReactNode;
};

export default function SearchResultCategory({ name, children }: Props) {
  return (
    <div className="flex-1 overflow-y-scroll">
      <span className="text-xs uppercase">{name}</span>
      <div className="mt-4 grid">{children}</div>
    </div>
  );
}
