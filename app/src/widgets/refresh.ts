import { ANDROID_WIDGETS, type AndroidWidgetName } from "./android/widgets";
import { buildWidgetSnapshot, type WidgetSnapshot } from "./snapshot";
import { syncWidgets, type WidgetStorage } from "./sync";

/** Onde os widgets de cada sistema são atualizados. `null` quando o sistema não está em uso. */
export type WidgetTargets = {
  ios: WidgetStorage | null;
  android: {
    save(snapshot: WidgetSnapshot): Promise<void>;
    update(name: AndroidWidgetName, snapshot: WidgetSnapshot): Promise<void>;
  } | null;
};

/** Atualiza os widgets do iPhone e do Android com o mesmo retrato. Falhas não derrubam o app. */
export async function refreshAllWidgets(snapshot: WidgetSnapshot, targets: WidgetTargets) {
  if (targets.ios) syncWidgets(snapshot, targets.ios);

  const { android } = targets;
  if (android) {
    try {
      await android.save(snapshot);
      for (const name of ANDROID_WIDGETS) {
        await android.update(name, snapshot);
      }
    } catch (error) {
      console.warn("Não foi possível atualizar os widgets do Android.", error);
    }
  }
}

/** Ao sair, os widgets passam a mostrar só o convite para abrir o app. */
export async function clearAllWidgets(targets: WidgetTargets) {
  await refreshAllWidgets(
    buildWidgetSnapshot({
      signedIn: false,
      queue: null,
      exams: [],
      faceIdEnabled: false,
      variant: "padrao",
      updatedAt: new Date(),
    }),
    targets,
  );
}
