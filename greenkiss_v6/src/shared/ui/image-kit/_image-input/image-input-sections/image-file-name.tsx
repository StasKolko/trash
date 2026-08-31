export const ImageFileName = ({ name }: { name: string }) => (
  <div className="relative py-2 my-3">
    <span className="text-md font-medium pl-5">{name}</span>
    <span
      aria-hidden="true"
      className="absolute top-0 left-2 h-full w-1 bg-primary rounded-md"
    />
  </div>
);
