export function ComparisonImage({ 
  src, 
  alt, 
}: {
  src: string;
  alt: string;
}) {
  return (
    <img
      alt={alt}
      className="absolute inset-0 w-full h-full object-contain"
      decoding="async"
      draggable={false}
      src={src}
    />
  );
}
