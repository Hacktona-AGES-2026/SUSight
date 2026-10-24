import { registerWidgetTaskHandler } from 'react-native-android-widget';
import { widgetTaskHandler } from './src/widgets/android/task-handler';
// Define as tarefas em segundo plano dos widgets (precisa ser no carregamento do app).
import './src/widgets/background';

// Widgets do Android (spec 004): desenhados mesmo com o app fechado.
registerWidgetTaskHandler(widgetTaskHandler);

// A navegação das telas continua sendo registrada pelo Expo Router.
import 'expo-router/entry';
