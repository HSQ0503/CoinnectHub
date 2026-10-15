type CoinMascotProps = {
  className?: string;
  pose?: "wave" | "happy" | "thinking";
};

export default function CoinMascot({ className = "" }: CoinMascotProps) {
  return (
    <svg
      viewBox="0 0 220 240"
      fill="none"
      className={`coin-mascot ${className}`}
      aria-hidden="true"
    >
      <ellipse cx="110" cy="219" rx="49" ry="6" fill="#061B45" opacity=".06" />
      <g className="mascot-body">
        <circle cx="116" cy="113" r="77" fill="#E9B810" />
        <circle cx="108" cy="108" r="77" fill="#FFCA20" />
        <circle cx="108" cy="108" r="66" fill="#0173CC" />
        <path
          d="M54 71C66 50 82 42 106 42"
          stroke="white"
          strokeOpacity=".5"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <g className="mascot-eyes">
          <rect x="78" y="69" width="23" height="30" rx="11.5" fill="white" />
          <rect x="117" y="69" width="23" height="30" rx="11.5" fill="white" />
          <rect x="88" y="77" width="9" height="16" rx="4.5" fill="#061B45" />
          <rect x="127" y="77" width="9" height="16" rx="4.5" fill="#061B45" />
        </g>
        <path
          d="M101 103Q109 111 117 103"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <image
          href="/coinnect-logo.png"
          x="81"
          y="108"
          width="54"
          height="53"
          preserveAspectRatio="xMidYMid meet"
        />
      </g>
    </svg>
  );
}
