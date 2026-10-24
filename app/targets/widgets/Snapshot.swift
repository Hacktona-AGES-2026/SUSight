import Foundation
import WidgetKit

/// Retrato gravado pelo app em src/widgets/sync.ts.
/// Regras e textos vêm prontos do app; a extensão só desenha.
struct WidgetSnapshot: Decodable {
  struct Exam: Decodable, Hashable {
    let name: String
    let statusText: String
    let pending: Bool
  }

  let signedIn: Bool
  let variant: String
  let signedOutText: String?
  let accessibilityText: String?
  let positionText: String?
  let ringProgress: Double?
  let pendingText: String?
  let exams: [Exam]?
  let riseText: String?
  let hideWhenLocked: Bool?
  let updatedAtText: String?
  let updatedAt: String?

  // Mesmos valores de APP_GROUP e SNAPSHOT_KEY em src/widgets/sync.ts.
  static let appGroup = "group.com.hacktonaages2026.pulse"
  static let key = "widget_snapshot"

  static let signedOutFallback = "Abra o SUSight para ver sua posição"

  static func load() -> WidgetSnapshot? {
    guard
      let json = UserDefaults(suiteName: appGroup)?.string(forKey: key),
      let data = json.data(using: .utf8)
    else { return nil }
    return try? JSONDecoder().decode(WidgetSnapshot.self, from: data)
  }

  var isInverted: Bool { variant == "invertido" }

  /// Frase lida pelo VoiceOver, montada no app (spec 004, item 10).
  var spokenText: String {
    accessibilityText ?? signedOutText ?? WidgetSnapshot.signedOutFallback
  }

  /// Dados com mais de um dia: o widget mostra a data da informação (spec 004, item 8).
  var isStale: Bool {
    guard let updatedAt, let date = ISO8601DateFormatter().date(from: updatedAt) else {
      return false
    }
    return Date.now.timeIntervalSince(date) > 24 * 60 * 60
  }

  /// Exemplo usado na galeria de widgets.
  static let preview = WidgetSnapshot(
    signedIn: true,
    variant: "padrao",
    signedOutText: nil,
    accessibilityText: "Sua posição na fila: 42ª de 118. 2 exames pendentes. Subiu 11 posições este mês.",
    positionText: "42ª",
    ringProgress: 77.0 / 118.0,
    pendingText: "2 exames pendentes",
    exams: [
      Exam(name: "Ressonância", statusText: "Pendente", pending: true),
      Exam(name: "Raio-X", statusText: "Em análise", pending: false),
      Exam(name: "Exame de sangue", statusText: "Recebido", pending: false),
    ],
    riseText: "Subiu 11 posições este mês",
    hideWhenLocked: false,
    updatedAtText: "Atualizada em 24 de out",
    updatedAt: nil
  )
}

struct SnapshotEntry: TimelineEntry {
  let date: Date
  let snapshot: WidgetSnapshot?
}

struct SnapshotProvider: TimelineProvider {
  func placeholder(in context: Context) -> SnapshotEntry {
    SnapshotEntry(date: .now, snapshot: .preview)
  }

  func getSnapshot(in context: Context, completion: @escaping (SnapshotEntry) -> Void) {
    let snapshot = context.isPreview ? .preview : WidgetSnapshot.load()
    completion(SnapshotEntry(date: .now, snapshot: snapshot))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<SnapshotEntry>) -> Void) {
    // O app recarrega os widgets quando os dados mudam; a hora seguinte é só reserva.
    let entry = SnapshotEntry(date: .now, snapshot: WidgetSnapshot.load())
    completion(Timeline(entries: [entry], policy: .after(.now.addingTimeInterval(60 * 60))))
  }
}
