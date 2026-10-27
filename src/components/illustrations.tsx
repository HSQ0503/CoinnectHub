export function SavingsIllustration({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 600 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="A savings notebook, a stack of coins, and a goal for a new pair of headphones"
    >
      <ellipse
        cx="330"
        cy="454"
        rx="245"
        ry="15"
        fill="#061B45"
        fillOpacity=".12"
      />
      <g transform="rotate(-8 250 250)">
        <rect
          x="84"
          y="64"
          width="318"
          height="359"
          rx="18"
          fill="#FFCA20"
          stroke="#061B45"
          strokeWidth="3"
        />
        <rect
          x="97"
          y="51"
          width="318"
          height="359"
          rx="18"
          fill="white"
          stroke="#061B45"
          strokeWidth="3"
        />
        <path d="M97 112H415" stroke="#061B45" strokeWidth="3" />
        <circle
          cx="122"
          cy="82"
          r="4"
          fill="#FFCA20"
          stroke="#061B45"
          strokeWidth="2"
        />
        <circle
          cx="139"
          cy="82"
          r="4"
          fill="#FFCA20"
          stroke="#061B45"
          strokeWidth="2"
        />
        <circle
          cx="156"
          cy="82"
          r="4"
          fill="#FFCA20"
          stroke="#061B45"
          strokeWidth="2"
        />
        <text
          x="126"
          y="157"
          fill="#061B45"
          fontSize="17"
          fontWeight="700"
          fontFamily="Arial, sans-serif"
        >
          My next big thing
        </text>
        <text
          x="126"
          y="208"
          fill="#061B45"
          fontSize="40"
          fontWeight="800"
          fontFamily="Arial, sans-serif"
        >
          A little closer.
        </text>
        <path
          d="M129 310V241M129 310H375"
          stroke="#061B45"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M149 310V284H186V310M207 310V263H244V310M265 310V240H302V310M323 310V219H360V310"
          fill="#FFCA20"
          stroke="#061B45"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <text
          x="137"
          y="332"
          fill="#061B45"
          fontSize="10"
          fontFamily="Arial, sans-serif"
        >
          Week 1
        </text>
        <text
          x="195"
          y="332"
          fill="#061B45"
          fontSize="10"
          fontFamily="Arial, sans-serif"
        >
          Week 2
        </text>
        <text
          x="253"
          y="332"
          fill="#061B45"
          fontSize="10"
          fontFamily="Arial, sans-serif"
        >
          Week 3
        </text>
        <text
          x="311"
          y="332"
          fill="#061B45"
          fontSize="10"
          fontFamily="Arial, sans-serif"
        >
          Week 4
        </text>
        <path
          d="M127 367H284"
          stroke="#061B45"
          strokeOpacity=".2"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M127 367H206"
          stroke="#087BD8"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M345 358L353 366L368 350"
          stroke="#087BD8"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <g transform="rotate(9 461 182)">
        <rect
          x="379"
          y="88"
          width="156"
          height="180"
          rx="16"
          fill="#FFCA20"
          stroke="#061B45"
          strokeWidth="3"
        />
        <path
          d="M418 174V161C418 140 434 124 456 124C478 124 494 140 494 161V174"
          stroke="#061B45"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <rect
          x="412"
          y="164"
          width="17"
          height="36"
          rx="8"
          fill="white"
          stroke="#061B45"
          strokeWidth="3"
        />
        <rect
          x="484"
          y="164"
          width="17"
          height="36"
          rx="8"
          fill="white"
          stroke="#061B45"
          strokeWidth="3"
        />
        <text
          x="410"
          y="234"
          fill="#061B45"
          fontSize="15"
          fontWeight="700"
          fontFamily="Arial, sans-serif"
        >
          Worth saving for.
        </text>
      </g>
      <g stroke="#061B45" strokeWidth="3">
        <path
          d="M383 421V439C383 450 417 459 459 459C501 459 535 450 535 439V421"
          fill="#FFCA20"
        />
        <ellipse cx="459" cy="421" rx="76" ry="20" fill="#FFCA20" />
        <path
          d="M383 400V418C383 429 417 438 459 438C501 438 535 429 535 418V400"
          fill="#FFCA20"
        />
        <ellipse cx="459" cy="400" rx="76" ry="20" fill="#FFCA20" />
        <path
          d="M383 379V397C383 408 417 417 459 417C501 417 535 408 535 397V379"
          fill="#FFCA20"
        />
        <ellipse cx="459" cy="379" rx="76" ry="20" fill="#FFCA20" />
        <path
          d="M403 406V416M428 413V423M458 416V426M488 413V423M514 405V415M403 428V438M428 435V445M488 435V445M514 427V437"
          strokeWidth="2"
        />
        <circle cx="448" cy="325" r="62" fill="#FFCA20" />
        <circle cx="448" cy="325" r="49" strokeWidth="2" />
        <path
          d="M462 305C458 295 430 294 430 311C430 329 466 318 466 337C466 353 438 355 430 344M448 288V363"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>
      <path
        d="M52 224H70M61 215V233M542 302H558M550 294V310"
        stroke="#FFCA20"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function GoalIllustration() {
  return (
    <svg
      viewBox="0 0 500 230"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      aria-hidden="true"
    >
      <g transform="rotate(-6 240 115)">
        <rect
          x="85"
          y="36"
          width="300"
          height="166"
          rx="13"
          fill="white"
          stroke="#061B45"
          strokeWidth="2.5"
        />
        <rect
          x="106"
          y="61"
          width="62"
          height="62"
          rx="12"
          fill="#FFCA20"
          stroke="#061B45"
          strokeWidth="2"
        />
        <path
          d="M120 95V90C120 68 154 68 154 90V95M121 91V104M153 91V104"
          stroke="#061B45"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <text
          x="185"
          y="81"
          fill="#061B45"
          fontFamily="Arial, sans-serif"
          fontWeight="700"
          fontSize="16"
        >
          New headphones
        </text>
        <text
          x="185"
          y="110"
          fill="#061B45"
          fontFamily="Arial, sans-serif"
          fontWeight="800"
          fontSize="25"
        >
          $120 goal
        </text>
        <rect
          x="106"
          y="144"
          width="255"
          height="12"
          rx="6"
          fill="#087BD8"
          fillOpacity=".12"
        />
        <rect x="106" y="144" width="85" height="12" rx="6" fill="#087BD8" />
        <text
          x="106"
          y="181"
          fill="#061B45"
          fontFamily="Arial, sans-serif"
          fontSize="12"
        >
          $40 saved
        </text>
        <text
          x="286"
          y="181"
          fill="#061B45"
          fontFamily="Arial, sans-serif"
          fontSize="12"
        >
          $80 to go
        </text>
      </g>
      <circle
        cx="389"
        cy="163"
        r="36"
        fill="#FFCA20"
        stroke="#061B45"
        strokeWidth="2.5"
      />
      <text
        x="375"
        y="178"
        fill="#061B45"
        fontFamily="Arial, sans-serif"
        fontSize="43"
        fontWeight="700"
      >
        $
      </text>
    </svg>
  );
}

export function QuizIllustration() {
  return (
    <svg
      viewBox="0 0 500 230"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      aria-hidden="true"
    >
      <g transform="rotate(-4 250 120)">
        <rect
          x="92"
          y="34"
          width="316"
          height="178"
          rx="16"
          fill="white"
          stroke="#061B45"
          strokeWidth="2.5"
        />
        <rect x="112" y="54" width="92" height="22" rx="11" fill="#FFCA20" />
        <text
          x="125"
          y="69"
          fill="#061B45"
          fontFamily="Arial, sans-serif"
          fontWeight="700"
          fontSize="11"
        >
          Breaking news
        </text>
        <text
          x="112"
          y="108"
          fill="#061B45"
          fontFamily="Arial, sans-serif"
          fontWeight="800"
          fontSize="20"
        >
          Profits beat the forecast.
        </text>
        <path
          d="M113 126H330M113 140H270"
          stroke="#061B45"
          strokeOpacity=".2"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <rect
          x="112"
          y="160"
          width="132"
          height="34"
          rx="17"
          fill="#0875CF"
        />
        <path
          d="M128 183L138 172L146 179L158 167"
          stroke="white"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M152 167H158V173" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <text
          x="168"
          y="182"
          fill="white"
          fontFamily="Arial, sans-serif"
          fontWeight="700"
          fontSize="12"
        >
          Rise
        </text>
        <rect
          x="254"
          y="160"
          width="132"
          height="34"
          rx="17"
          fill="white"
          stroke="#061B45"
          strokeWidth="2"
        />
        <path
          d="M270 170L280 181L288 174L300 186"
          stroke="#061B45"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M294 186H300V180" stroke="#061B45" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <text
          x="310"
          y="182"
          fill="#061B45"
          fontFamily="Arial, sans-serif"
          fontWeight="700"
          fontSize="12"
        >
          Fall
        </text>
      </g>
      <circle
        cx="418"
        cy="62"
        r="34"
        fill="#FFCA20"
        stroke="#061B45"
        strokeWidth="2.5"
      />
      <text
        x="404"
        y="78"
        fill="#061B45"
        fontFamily="Arial, sans-serif"
        fontWeight="800"
        fontSize="42"
      >
        ?
      </text>
    </svg>
  );
}
