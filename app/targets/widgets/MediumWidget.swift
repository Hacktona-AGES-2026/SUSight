import SwiftUI
import WidgetKit

/// Widget médio (Figma 101-343): anel, "Sua posição", exames e "Subiu X posições este mês".
struct MediumPositionView: View {
  let snapshot: WidgetSnapshot?

  var body: some View {
    let theme = WidgetTheme(inverted: snapshot?.isInverted == true)
    Group {
      if let snapshot, snapshot.signedIn {
        HStack(spacing: 18) {
          // Tocar só abre o app: o anel no Início, a lista em Documentos (spec 004, item 3).
          Link(destination: URL(string: "pulse://inicio")!) {
            PositionRing(snapshot: snapshot, theme: theme, lineWidth: 11)
              .frame(width: 100, height: 100)
          }
          Link(destination: URL(string: "pulse://documentos")!) {
            details(snapshot, theme: theme)
          }
        }
      } else {
        SignedOutView(
          text: snapshot?.signedOutText ?? WidgetSnapshot.signedOutFallback,
          theme: theme
        )
        .widgetURL(URL(string: "pulse://inicio"))
      }
    }
    .containerBackground(for: .widget) { theme.background }
  }

  private func details(_ snapshot: WidgetSnapshot, theme: WidgetTheme) -> some View {
    VStack(alignment: .leading, spacing: 9) {
      Text("Sua posição")
        .font(.headline)
        .foregroundStyle(theme.primaryText)
      if let exams = snapshot.exams, !exams.isEmpty {
        ForEach(exams, id: \.self) { exam in
          HStack(spacing: 7) {
            Circle()
              .fill(theme.dot(pending: exam.pending))
              .frame(width: 8, height: 8)
            Text(exam.name)
              .font(.subheadline.weight(.semibold))
              .foregroundStyle(theme.itemText)
              .lineLimit(1)
            Spacer(minLength: 4)
            Text(exam.statusText)
              .font(.caption)
              .foregroundStyle(theme.secondaryText)
              .lineLimit(1)
          }
        }
      } else {
        Text(snapshot.pendingText ?? "")
          .font(.subheadline)
          .foregroundStyle(theme.itemText)
      }
      // Sem conexão há mais de um dia, a data da informação vem no lugar da variação.
      if let footer = snapshot.isStale ? snapshot.updatedAtText : snapshot.riseText {
        Text(footer)
          .font(.caption)
          .foregroundStyle(theme.secondaryText)
          .lineLimit(1)
      }
    }
    .frame(maxWidth: .infinity, alignment: .leading)
  }
}

struct MediumPositionWidget: Widget {
  let kind = "MediumPositionWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: SnapshotProvider()) { entry in
      MediumPositionView(snapshot: entry.snapshot)
    }
    .configurationDisplayName("Sua posição e seus exames")
    .description("Mostra sua posição na fila e a situação dos seus exames.")
    .supportedFamilies([.systemMedium])
  }
}
