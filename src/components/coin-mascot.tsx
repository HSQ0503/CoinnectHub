type CoinMascotProps = {
  className?: string;
  pose?: "wave" | "happy" | "thinking";
};

export default function CoinMascot({
  className = "",
  pose = "happy",
}: CoinMascotProps) {
  return (
    <svg
      viewBox="0 0 250 270"
      fill="none"
      className={`coin-mascot mascot-${pose} ${className}`}
      aria-hidden="true"
    >
      <ellipse
        className="mascot-shadow"
        cx="125"
        cy="246"
        rx="62"
        ry="8"
        fill="#061B45"
        opacity=".08"
      />
      <g className="mascot-body">
        <g
          className="mascot-feet"
          stroke="#061B45"
          strokeWidth="4"
          strokeLinecap="round"
        >
          <path d="M103 208L98 234H80" />
          <path d="M149 208L156 234H173" />
        </g>
        <g
          className="mascot-left-arm"
          stroke="#061B45"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M44 143L25 160L18 148" />
          <circle cx="17" cy="145" r="9" fill="#FFCA20" />
        </g>
        <g
          className="mascot-right-arm"
          stroke="#061B45"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M205 132L226 111L226 88" />
          <path d="M220 88L216 79M226 85V74M232 88L237 80" />
          <circle cx="226" cy="91" r="10" fill="#FFCA20" />
        </g>
        <circle
          cx="129"
          cy="128"
          r="90"
          fill="#FFCA20"
          stroke="#061B45"
          strokeWidth="3"
        />
        <path
          d="M171 49C207 66 224 105 216 144C209 178 185 203 153 214"
          stroke="#061B45"
          strokeWidth="2"
        />
        <circle
          cx="120"
          cy="125"
          r="88"
          fill="#FFCA20"
          stroke="#061B45"
          strokeWidth="3"
        />
        <circle
          cx="120"
          cy="125"
          r="76"
          fill="#0173CC"
          stroke="#061B45"
          strokeWidth="2"
        />
        <path
          d="M88 47L92 58M61 67L70 76M44 96L56 99M42 130H54M54 167L65 160M82 192L88 181M118 201V189M155 192L150 181M182 168L172 160M195 131H183M188 96L176 100M169 67L160 76M141 47L138 58"
          stroke="#061B45"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <g className="mascot-eyes">
          <rect x="85" y="75" width="25" height="34" rx="12.5" fill="white" />
          <rect x="128" y="75" width="25" height="34" rx="12.5" fill="white" />
          <rect
            className="mascot-pupil"
            x="96"
            y="84"
            width="10"
            height="17"
            rx="5"
            fill="#061B45"
          />
          <rect
            className="mascot-pupil"
            x="139"
            y="84"
            width="10"
            height="17"
            rx="5"
            fill="#061B45"
          />
        </g>
        <image
          href="/coinnect-logo.png"
          x="80"
          y="112"
          width="80"
          height="79"
          preserveAspectRatio="xMidYMid meet"
        />
        <path
          d="M112 109Q120 116 128 109"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
