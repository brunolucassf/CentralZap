import logoUrl from '../logo.svg';

interface LogoProps {
  size?: number; // largura em px
  className?: string;
  withWordmark?: boolean; // mostra o texto "Central Zap" ao lado
}

/**
 * Componente de logo do Central Zap.
 * Importa o SVG (em src/logo.svg) e o renderiza como imagem.
 * Usado na tela de login e na sidebar.
 */
export default function Logo({ size = 40, className = '', withWordmark = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src={logoUrl}
        alt="Central Zap"
        width={size}
        height={size}
        className="select-none drop-shadow-[0_4px_14px_rgba(16,185,129,0.35)]"
        style={{ width: size, height: size }}
      />
      {withWordmark && (
        <span className="text-lg font-extrabold tracking-tight">
          Central<span className="text-accent"> Zap</span>
        </span>
      )}
    </div>
  );
}
