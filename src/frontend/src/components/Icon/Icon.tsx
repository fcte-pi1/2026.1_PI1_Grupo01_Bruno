interface IconProps {
    name: string
    size?: 'base' | 'lg' | '2x' | '3x' | '4x' | '5x'
    filled?: boolean
    className?: string
    color?: string
}

export function Icon({ name, size, filled, className, color }: IconProps){
    return (
        <span
            className={`icon ${className ?? ''} `}
            style={{
                fontSize: size ? `var(--icon-size-${size})` : `var(--icon-size-base)`,
                fontVariationSettings: filled
                    ? `'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24`
                    : `'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
                color: color ? `var(--${color})` : 'inherit',
            }}
        >
            {name}
        </span>
    )
}