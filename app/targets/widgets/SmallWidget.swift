import SwiftUI
import WidgetKit

/// Widget pequeno (Figma 101-85): anel, "Sua posição na fila" e exames pendentes.
struct SmallPositionView: View {
  let snapshot: WidgetSnapshot?

  var body: some View {
    let theme = WidgetTheme(inverted: snapshot?.isInverted == true)
    Group {
      if let snapshot, snapshot.signedIn {
        VStack(alignment: .leading, spacing: 6) {
          PositionRing(snapshot: snapshot, theme: theme, lineWidth: 8)
            .frame(width: 76, height: 76)
          Spacer(minLength: 0)
          Text("Sua posição na fila")
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(theme.primaryText)
            .lineLimit(1)
            .minimumScaleFactor(0.8)
          HStack(spacing: 6) {
            Circle()
              .fill(theme.dot(pending: true))
              .frame(width: 8, height: 8)
            Text(snapshot.isStale ? snapshot.updatedAtText ?? "" : snapshot.pendingText ?? "")
              .font(.footnote)
              .foregroundStyle(theme.secondaryText)
              .lineLimit(1)
              .minimumScaleFactor(0.8)
          }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
      } else {
        SignedOutView(
          text: snapshot?.signedOutText ?? WidgetSnapshot.signedOutFallback,
          theme: theme
        )
      }
    }
    .containerBackground(for: .widget) { theme.background }
    // Tocar só abre o app, no Início (spec 004, item 3).
    .widgetURL(URL(string: "pulse://inicio"))
  }
}

struct SmallPositionWidget: Widget {
  let kind = "SmallPositionWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: SnapshotProvider()) { entry in
      SmallPositionView(snapshot: entry.snapshot)
    }
    .configurationDisplayName("Sua posição na fila")
    .description("Mostra sua posição na fila e os exames pendentes.")
    .supportedFamilies([.systemSmall])
  }
}
