interface AvatarProps {
  name: string;
  src?: string | null;
  size?: number;
  color?: string;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Avatar com fallback de iniciais (e cor de fundo derivada do nome)
export default function Avatar({ name, src, size = 40, color }: AvatarProps) {
  const bg = color || '#10b981';
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="grid place-items-center rounded-full font-semibold text-white shrink-0"
      style={{ width: size, height: size, background: bg, fontSize: size * 0.36 }}
    >
      {initials(name)}
    </div>
  );
}
