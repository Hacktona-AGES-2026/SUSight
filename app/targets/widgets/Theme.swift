import SwiftUI

/// Cores do Figma: variante padrão (101-85, 101-343) e invertida, fundo rosa (106-676, 106-838).
struct WidgetTheme {
  let inverted: Bool

  var background: Color {
    inverted ? Color(hex: 0xB02A68, opacity: 0.88) : Color(hex: 0xFFFFFF, opacity: 0.95)
  }
  var primaryText: Color { inverted ? .white : Color(hex: 0x1C1C1E) }
  var itemText: Color { inverted ? .white.opacity(0.82) : Color(hex: 0x1C1C1E) }
  var secondaryText: Color { inverted ? .white.opacity(0.82) : Color(hex: 0x636366) }
  var ringTrack: Color { inverted ? .white.opacity(0.3) : Color(hex: 0xF9D6E4) }
  var ringProgress: Color { inverted ? .white : Color(hex: 0xA3205B) }

  func dot(pending: Bool) -> Color {
    if inverted { return .white.opacity(0.85) }
    return pending ? Color(hex: 0xC42C6D) : Color(hex: 0xA3205B)
  }
}

extension Color {
  init(hex: UInt32, opacity: Double = 1) {
    self.init(
      .sRGB,
      red: Double((hex >> 16) & 0xFF) / 255,
      green: Double((hex >> 8) & 0xFF) / 255,
      blue: Double(hex & 0xFF) / 255,
      opacity: opacity
    )
  }
}
