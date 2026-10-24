import SwiftUI

/// Anel com a posição no centro. Quanto mais perto da frente da fila, mais cheio.
struct PositionRing: View {
  let snapshot: WidgetSnapshot
  let theme: WidgetTheme
  let lineWidth: CGFloat

  var body: some View {
    ZStack {
      Circle()
        .stroke(theme.ringTrack, lineWidth: lineWidth)
      Circle()
        .trim(from: 0, to: snapshot.ringProgress ?? 0)
        .stroke(theme.ringProgress, lineWidth: lineWidth)
        .rotationEffect(.degrees(-90))
      Text(snapshot.positionText ?? "–")
        .font(.title.weight(.semibold))
        .minimumScaleFactor(0.6)
        .lineLimit(1)
        .foregroundStyle(theme.primaryText)
    }
    .padding(lineWidth / 2)
    // Com Face ID ativo, o iOS esconde a posição com o aparelho bloqueado.
    .privacySensitive(snapshot.hideWhenLocked == true)
    .accessibilityElement(children: .ignore)
    .accessibilityLabel(
      snapshot.positionText.map { "Sua posição na fila: \($0)" } ?? "Posição indisponível"
    )
  }
}

/// Sem sessão ou sem dados: só orienta a abrir o app.
struct SignedOutView: View {
  let text: String
  let theme: WidgetTheme

  var body: some View {
    Text(text)
      .font(.subheadline.weight(.semibold))
      .foregroundStyle(theme.primaryText)
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomLeading)
  }
}
