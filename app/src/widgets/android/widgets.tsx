import React from "react";
import { FlexWidget, SvgWidget, TextWidget } from "react-native-android-widget";
import { WIDGET_LINKS } from "../links";
import type { SignedInSnapshot, WidgetSnapshot } from "../snapshot";
import { ringSvg } from "./ring";
import { androidTheme, type AndroidWidgetTheme } from "./theme";

// Widgets de tela inicial do Android (spec 004). Os nomes também estão no app.json.
export const ANDROID_WIDGETS = ["PositionWidget", "NextExamWidget", "WeekWidget"] as const;
export type AndroidWidgetName = (typeof ANDROID_WIDGETS)[number];

// Tamanhos do Figma, em dp. Os textos acompanham o tamanho de fonte do sistema (allowFontScaling).
const RADIUS = 32;
const RING_SIZE = 104;

export function renderAndroidWidget(name: string, snapshot: WidgetSnapshot) {
  const theme = androidTheme(snapshot.variant);
  if (!snapshot.signedIn) return <SignedOut text={snapshot.signedOutText} theme={theme} />;
  switch (name as AndroidWidgetName) {
    case "NextExamWidget":
      return <NextExam snapshot={snapshot} theme={theme} />;
    case "WeekWidget":
      return <Week snapshot={snapshot} theme={theme} />;
    default:
      return <Position snapshot={snapshot} theme={theme} />;
  }
}

type Props = { snapshot: SignedInSnapshot; theme: AndroidWidgetTheme };

const openUri = (uri: string) => ({
  clickAction: "OPEN_URI",
  clickActionData: { uri },
});

function Position({ snapshot, theme }: Props) {
  const examsText = snapshot.exams.length
    ? `Seus exames: ${snapshot.exams.map((e) => `${e.name}, ${e.statusText.toLowerCase()}`).join("; ")}.`
    : `${snapshot.pendingText}.`;
  return (
    <FlexWidget
      accessibilityLabel={snapshot.accessibilityText}
      style={{
        height: "match_parent",
        width: "match_parent",
        flexDirection: "row",
        alignItems: "center",
        flexGap: 18,
        paddingHorizontal: 22,
        paddingVertical: 20,
        backgroundColor: theme.wideBackground,
        borderRadius: RADIUS,
      }}
    >
      <FlexWidget
        {...openUri(WIDGET_LINKS.inicio)}
        accessibilityLabel={snapshot.accessibilityText}
        style={{ width: RING_SIZE, height: RING_SIZE, justifyContent: "center", alignItems: "center" }}
      >
        <SvgWidget
          svg={ringSvg({
            progress: snapshot.ringProgress,
            size: RING_SIZE,
            strokeWidth: 11,
            track: theme.ringTrack,
            fill: theme.ringFill,
          })}
          style={{ width: RING_SIZE, height: RING_SIZE }}
        />
        <TextWidget
          text={snapshot.positionText ?? "–"}
          style={{ fontSize: 30, fontWeight: "600", color: theme.primaryText, marginTop: -RING_SIZE / 2 - 18 }}
        />
      </FlexWidget>
      <FlexWidget
        {...openUri(WIDGET_LINKS.documentos)}
        accessibilityLabel={examsText}
        style={{ flex: 1, flexDirection: "column", flexGap: 8 }}
      >
        <TextWidget
          text="Sua posição na fila"
          maxLines={1}
          style={{ fontSize: 17, fontWeight: "600", color: theme.primaryText }}
        />
        {snapshot.exams.map((exam) => (
          <FlexWidget
            key={exam.name}
            style={{ width: "match_parent", flexDirection: "row", alignItems: "center", flexGap: 8 }}
          >
            <FlexWidget
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: exam.pending ? theme.pendingDot : theme.otherDot,
              }}
            />
            <FlexWidget style={{ flex: 1 }}>
              <TextWidget
                text={exam.name}
                maxLines={1}
                truncate="END"
                style={{ fontSize: 14, fontWeight: "600", color: theme.primaryText }}
              />
            </FlexWidget>
            <TextWidget text={exam.statusText} maxLines={1} style={{ fontSize: 12, color: theme.secondaryText }} />
          </FlexWidget>
        ))}
      </FlexWidget>
    </FlexWidget>
  );
}

function SmallCard({
  label,
  value,
  caption,
  valueSize,
  background,
  labelColor,
  theme,
  accessibilityLabel,
  uri,
}: {
  label: string;
  value: string;
  caption: string;
  valueSize: number;
  background: AndroidWidgetTheme["wideBackground"];
  labelColor: AndroidWidgetTheme["softText"];
  theme: AndroidWidgetTheme;
  accessibilityLabel: string;
  uri: string;
}) {
  return (
    <FlexWidget
      {...openUri(uri)}
      accessibilityLabel={accessibilityLabel}
      style={{
        height: "match_parent",
        width: "match_parent",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 18,
        backgroundColor: background,
        borderRadius: RADIUS,
      }}
    >
      <TextWidget text={label} style={{ fontSize: 14, color: labelColor }} />
      <FlexWidget style={{ flexDirection: "column", flexGap: 2 }}>
        <TextWidget
          text={value}
          maxLines={1}
          truncate="END"
          style={{ fontSize: valueSize, fontWeight: valueSize > 30 ? "700" : "600", color: theme.primaryText }}
        />
        <TextWidget text={caption} maxLines={2} style={{ fontSize: 13, color: labelColor }} />
      </FlexWidget>
    </FlexWidget>
  );
}

function NextExam({ snapshot, theme }: Props) {
  const exam = snapshot.nextExam;
  return (
    <SmallCard
      label="Próximo exame"
      value={exam?.name ?? "Tudo em dia"}
      caption={exam?.dueText ?? snapshot.pendingText}
      valueSize={20}
      background={theme.nextExamBackground}
      labelColor={theme.softText}
      theme={theme}
      accessibilityLabel={
        exam ? `Próximo exame: ${exam.name}. ${exam.dueText}.` : `Próximo exame: ${snapshot.pendingText}.`
      }
      uri={WIDGET_LINKS.documentos}
    />
  );
}

function Week({ snapshot, theme }: Props) {
  const { valueText, captionText } = snapshot.week;
  const rose = valueText.startsWith("↑");
  return (
    <SmallCard
      label="Esta semana"
      value={valueText}
      caption={captionText}
      valueSize={44}
      background={theme.weekBackground}
      labelColor={theme.secondaryText}
      theme={theme}
      accessibilityLabel={
        rose
          ? `Esta semana você subiu ${valueText.replace("↑ ", "")} ${captionText} na fila.`
          : `Sua posição na fila: ${valueText}.`
      }
      uri={WIDGET_LINKS.inicio}
    />
  );
}

function SignedOut({ text, theme }: { text: string; theme: AndroidWidgetTheme }) {
  return (
    <FlexWidget
      {...openUri(WIDGET_LINKS.inicio)}
      accessibilityLabel={text}
      style={{
        height: "match_parent",
        width: "match_parent",
        justifyContent: "flex-end",
        padding: 18,
        backgroundColor: theme.wideBackground,
        borderRadius: RADIUS,
      }}
    >
      <TextWidget text={text} maxLines={3} style={{ fontSize: 15, fontWeight: "600", color: theme.primaryText }} />
    </FlexWidget>
  );
}
