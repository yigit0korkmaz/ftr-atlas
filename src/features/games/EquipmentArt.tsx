import { useId, type ReactNode } from "react";
import { equipmentById } from "./detective-data";
export function EquipmentArt({
  id,
  decorative = false,
}: {
  id: string;
  decorative?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const dark = "#174b60",
    light = "#a8e7d5",
    mid = "#52aaa4",
    white = "#f7fffc",
    warm = "#efbb83";
  const stroke = {
    stroke: dark,
    strokeWidth: 3,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const dumbbell = (x: number, y: number, angle: number) => (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <rect x="-29" y="-6" width="58" height="12" rx="4" fill={mid} />
      <rect x="-39" y="-22" width="15" height="44" rx="5" fill={dark} />
      <rect x="24" y="-22" width="15" height="44" rx="5" fill={dark} />
      <path d="M-33-16v32M30-16v32" stroke={light} strokeWidth="3" />
    </g>
  );
  const crutch = (x: number) => (
    <g transform={`translate(${x} 12)`} {...stroke}>
      <path d="M-13 14L-7 62 0 91 7 62 13 14" fill="none" />
      <path d="M-11 42h22M0 91v8" />
      <rect x="-17" y="5" width="34" height="12" rx="5" fill={light} />
      <path d="M-4 100h8" strokeWidth="7" />
    </g>
  );
  let art: ReactNode;
  switch (id) {
    case "dumbbells":
      art = (
        <>
          {dumbbell(62, 42, -20)}
          {dumbbell(103, 86, 18)}
        </>
      );
      break;
    case "band":
      art = (
        <g {...stroke} fill="none">
          <path
            d="M28 37C49 7 125 19 129 48S100 104 56 100 20 78 36 57 80 33 112 53"
            stroke={mid}
            strokeWidth="14"
          />
          <path d="M32 34C62 14 120 21 125 47" stroke={light} strokeWidth="4" />
        </g>
      );
      break;
    case "ball":
      art = (
        <g {...stroke}>
          <circle cx="80" cy="65" r="47" fill={light} />
          <path
            d="M42 37C67 50 93 50 118 37M34 61C66 77 96 77 126 61M43 88C67 101 94 101 116 88M78 19C61 46 62 87 80 111"
            fill="none"
            stroke={mid}
            strokeWidth="2"
          />
          <ellipse
            cx="63"
            cy="39"
            rx="12"
            ry="6"
            fill={white}
            stroke="none"
            transform="rotate(-25 63 39)"
          />
        </g>
      );
      break;
    case "balance":
      art = (
        <g {...stroke}>
          <path d="M68 78Q80 117 95 78" fill={dark} />
          <ellipse cx="80" cy="66" rx="59" ry="24" fill={mid} />
          <ellipse cx="80" cy="58" rx="59" ry="24" fill={light} />
          <ellipse
            cx="80"
            cy="58"
            rx="39"
            ry="14"
            fill="none"
            stroke={mid}
            strokeWidth="2"
          />
          <path d="M65 57h30" stroke={white} />
        </g>
      );
      break;
    case "roller":
      art = (
        <g {...stroke}>
          <path d="M43 37L115 58V104L43 84Z" fill={mid} />
          <path d="M44 37C59 35 128 51 132 67" fill="none" />
          <ellipse cx="43" cy="61" rx="20" ry="25" fill={light} />
          <ellipse cx="116" cy="82" rx="20" ry="25" fill={light} />
          <ellipse cx="116" cy="82" rx="9" ry="13" fill={dark} />
          <path d="M66 48v40M83 54v39M99 60v38" stroke={dark} strokeWidth="2" />
        </g>
      );
      break;
    case "mat":
      art = (
        <g {...stroke}>
          <path d="M19 86L81 30 144 54 81 111Z" fill={mid} />
          <path d="M19 80L81 24 144 48 81 105Z" fill={light} />
          <path
            d="M44 64l61 23M53 55l61 23M62 47l61 23M72 38l61 23"
            fill="none"
            stroke={mid}
            strokeWidth="2"
          />
        </g>
      );
      break;
    case "treadmill":
      art = (
        <g {...stroke}>
          <path d="M22 101l84 10 36-27-85-9Z" fill={dark} />
          <path d="M37 98l63 7 26-19-63-7Z" fill={mid} />
          <path
            d="M110 77l-8-43M133 80l-15-47M65 76l-4-25 46-6"
            fill="none"
            strokeWidth="5"
          />
          <path d="M40 106l-3 8M125 98v14" strokeWidth="6" />
          <path d="M97 38l-8-20 39 4 8 20Z" fill={light} />
          <path d="M100 23l24 3 4 10-24-2Z" fill={dark} />
          <path d="M108 28h11" stroke={light} strokeWidth="2" />
        </g>
      );
      break;
    case "bike":
      art = (
        <g {...stroke}>
          <path
            d="M33 109h32M100 110h33M48 108l20-63M118 108l-20-46"
            fill="none"
            strokeWidth="5"
          />
          <circle cx="77" cy="82" r="24" fill={light} />
          <circle cx="77" cy="82" r="13" fill={mid} />
          <path d="M75 81l15 8 13-2M77 82l-12-8-11 2" fill="none" />
          <path d="M65 47l-5-13M56 32h26" strokeWidth="7" />
          <path d="M95 61l17-32-12-9M112 29l15 4" fill="none" strokeWidth="5" />
          <rect x="98" y="11" width="29" height="18" rx="4" fill={dark} />
          <path d="M104 17h16M104 22h9" stroke={light} strokeWidth="2" />
        </g>
      );
      break;
    case "parallel":
      art = (
        <g {...stroke}>
          <path
            d="M25 100L57 69 136 89 104 119Z"
            fill="#daeae6"
            stroke="none"
          />
          <path
            d="M35 91V39L106 55V109M60 69V20L132 36V91"
            fill="none"
            strokeWidth="6"
          />
          <path d="M35 40L106 56M60 21L132 37" stroke={mid} strokeWidth="9" />
          <path d="M28 97h14M100 113h14M53 74h14M125 95h14" strokeWidth="4" />
        </g>
      );
      break;
    case "walker":
      art = (
        <g {...stroke} fill="none">
          <path
            d="M40 109L46 35Q48 24 62 29L110 42 123 111M46 35L75 18Q84 14 88 26L99 92M110 42L132 27 142 99M46 62L117 77M111 43L132 29"
            strokeWidth="5"
          />
          <path d="M49 33l15 4M114 40l13-8" stroke={mid} strokeWidth="9" />
          <path d="M35 111h10M118 113h10M94 95h10M138 102h9" strokeWidth="6" />
        </g>
      );
      break;
    case "crutches":
      art = (
        <>
          {crutch(53)}
          {crutch(106)}
        </>
      );
      break;
    case "cane":
      art = (
        <g {...stroke} fill="none">
          <path d="M88 107V41Q88 18 68 19H53" strokeWidth="7" />
          <path d="M51 19h20" stroke={mid} strokeWidth="12" />
          <path d="M82 111h12" strokeWidth="9" />
          <path d="M87 61v18" stroke={light} strokeWidth="2" />
        </g>
      );
      break;
    case "goniometer":
      art = (
        <g {...stroke}>
          <path d="M40 74L130 26 138 39 52 87Z" fill={light} />
          <path d="M42 74l97 20-3 16-97-22Z" fill="#daeae6" />
          <circle cx="48" cy="79" r="30" fill={white} />
          <path d="M25 79a23 23 0 0 1 46 0" fill="none" stroke={mid} />
          <path
            d="M28 78h5M32 65l4 4M48 57v6M64 65l-4 4M68 78h-5"
            strokeWidth="2"
          />
          <circle cx="48" cy="79" r="5" fill={dark} />
          <path d="M75 63l46-25M79 91l45 10" stroke={mid} strokeWidth="2" />
        </g>
      );
      break;
    case "hammer":
      art = (
        <g {...stroke}>
          <path d="M62 48L105 111" strokeWidth="12" />
          <path d="M63 49l32 48" stroke={light} strokeWidth="3" />
          <path d="M31 40L78 14 96 66Z" fill={warm} />
          <path d="M43 40L76 23" fill="none" stroke="#ffdfbd" strokeWidth="5" />
        </g>
      );
      break;
    case "tape":
      art = (
        <g {...stroke}>
          <path
            d="M50 76c34 21 58 16 82-8v27c-25 22-49 28-82 8Z"
            fill={light}
          />
          <path
            d="M50 76c-29-16-19-40 5-42s47 12 39 29-27 21-44 13Z"
            fill={warm}
          />
          <ellipse cx="61" cy="54" rx="17" ry="10" fill={white} />
          <path
            d="M65 87v9M80 91v13M96 90v9M112 83v13M124 77v9"
            strokeWidth="2"
          />
        </g>
      );
      break;
    case "oximeter":
      art = (
        <g {...stroke}>
          <path
            d="M39 50L103 37Q124 38 127 59L124 93Q122 107 105 107L48 102Q35 99 35 82Z"
            fill={mid}
          />
          <path
            d="M37 47Q38 28 57 25L109 25Q126 27 126 45L124 76Q122 86 108 87L48 81Q35 77 37 62Z"
            fill={light}
          />
          <rect x="52" y="35" width="57" height="35" rx="6" fill={dark} />
          <path
            d="M60 45h14M60 52h9M86 45h12M86 53h10M62 61h12"
            stroke={light}
            strokeWidth="3"
          />
          <circle cx="117" cy="66" r="4" fill={dark} />
          <path d="M44 88l61 10" stroke={dark} strokeWidth="5" />
        </g>
      );
      break;
    default:
      art = <circle cx="80" cy="65" r="35" fill={light} />;
  }
  return (
    <svg
      viewBox="0 0 160 130"
      className="fd-equipment-art"
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-labelledby={decorative ? undefined : `${uid}-title`}
    >
      <title id={`${uid}-title`}>
        {equipmentById.get(id)?.name ?? "Fizyoterapi ekipmanı"}
      </title>
      <ellipse cx="80" cy="115" rx="55" ry="6" fill="#174b600c" />
      {art}
    </svg>
  );
}
