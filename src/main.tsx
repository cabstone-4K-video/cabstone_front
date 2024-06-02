
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Provider } from 'react-redux'
import { store, persistor } from './store/store.ts';
import { PersistGate } from 'redux-persist/integration/react';
import * as serviceWorkerRegistration from './serviceWorkerRegistration.ts'
import '@babel/polyfill';
import 'regenerator-runtime/runtime'; // 이 줄도 포함합니다.

ReactDOM.createRoot(document.getElementById('root')!).render(
  
	<Provider store={store}>
		<PersistGate loading={null} persistor={persistor}>
			<App />
		</PersistGate>
	</Provider>
)

serviceWorkerRegistration.unregister()