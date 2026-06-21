type BrandIconProps = {
  size?: number;
  className?: string;
};

export function BrandIcon({ size = 32, className }: BrandIconProps) {
  return <img src="/icon.ico" alt="" aria-hidden="true" width={size} height={size} className={className} />;
}
