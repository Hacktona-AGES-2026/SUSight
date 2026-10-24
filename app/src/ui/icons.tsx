import Svg, { Path } from "react-native-svg";

// Ícones do Figma (22 × 22, traço de 2). A cor muda com o estado, por isso o traço vem por propriedade.
// Decorativos: quem usa dá o rótulo para o leitor de tela.

type IconProps = { color: string };

function Icon({ color, paths, viewBox = 22 }: IconProps & { paths: string[]; viewBox?: number }) {
  return (
    <Svg width={22} height={22} viewBox={`0 0 ${viewBox} ${viewBox}`} fill="none" accessible={false}>
      {paths.map((d) => (
        <Path key={d} d={d} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </Svg>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <Icon
      {...props}
      paths={[
        "M2.75 8.25L11 1.83333L19.25 8.25V18.3333C19.25 18.8196 19.0568 19.2859 18.713 19.6297C18.3692 19.9735 17.9029 20.1667 17.4167 20.1667H4.58333C4.0971 20.1667 3.63079 19.9735 3.28697 19.6297C2.94315 19.2859 2.75 18.8196 2.75 18.3333V8.25Z",
        "M8.25 20.1667V11H13.75V20.1667",
      ]}
    />
  );
}

export function DocumentIcon(props: IconProps) {
  return (
    <Icon
      {...props}
      paths={[
        "M12.8333 1.83333H5.5C5.01377 1.83333 4.54745 2.02649 4.20364 2.3703C3.85982 2.71412 3.66667 3.18044 3.66667 3.66667V18.3333C3.66667 18.8196 3.85982 19.2859 4.20364 19.6297C4.54745 19.9735 5.01377 20.1667 5.5 20.1667H16.5C16.9862 20.1667 17.4525 19.9735 17.7964 19.6297C18.1402 19.2859 18.3333 18.8196 18.3333 18.3333V7.33333L12.8333 1.83333Z",
        "M12.8333 1.83333V7.33333H18.3333",
      ]}
    />
  );
}

export function HistoryIcon(props: IconProps) {
  return (
    <Icon
      {...props}
      paths={[
        "M20.1667 11C20.1667 16.0626 16.0626 20.1667 11 20.1667C5.93739 20.1667 1.83333 16.0626 1.83333 11C1.83333 5.93739 5.93739 1.83333 11 1.83333C16.0626 1.83333 20.1667 5.93739 20.1667 11Z",
        "M11 5.5V11L14.6667 12.8333",
      ]}
    />
  );
}

export function ProfileIcon(props: IconProps) {
  return (
    <Icon
      {...props}
      paths={[
        "M17.4167 19.25V17.4167C17.4167 16.4442 17.0304 15.5116 16.3427 14.8239C15.6551 14.1363 14.7225 13.75 13.75 13.75H8.25C7.27754 13.75 6.34491 14.1363 5.65728 14.8239C4.96964 15.5116 4.58333 16.4442 4.58333 17.4167V19.25",
        "M14.6667 6.41667C14.6667 8.44171 13.025 10.0833 11 10.0833C8.97496 10.0833 7.33333 8.44171 7.33333 6.41667C7.33333 4.39162 8.97496 2.75 11 2.75C13.025 2.75 14.6667 4.39162 14.6667 6.41667Z",
      ]}
    />
  );
}

export function BackIcon(props: IconProps) {
  return <Icon {...props} paths={["M13.75 16.5L8.25 11L13.75 5.5"]} />;
}

/** Sino do Início (desenhado em 24 × 24 no Figma e exibido em 22 × 22). */
export function BellIcon(props: IconProps) {
  return (
    <Icon
      {...props}
      viewBox={24}
      paths={[
        "M6 8C6 6.4087 6.63214 4.88258 7.75736 3.75736C8.88258 2.63214 10.4087 2 12 2C13.5913 2 15.1174 2.63214 16.2426 3.75736C17.3679 4.88258 18 6.4087 18 8C18 15 21 17 21 17H3C3 17 6 15 6 8Z",
        "M10.3 21C10.4674 21.3044 10.7134 21.5583 11.0125 21.7352C11.3115 21.912 11.6526 22.0053 12 22.0053C12.3474 22.0053 12.6885 21.912 12.9875 21.7352C13.2866 21.5583 13.5326 21.3044 13.7 21",
      ]}
    />
  );
}
