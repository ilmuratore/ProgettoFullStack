import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/index.css";

// Debug temporaneo — rimuovere dopo risoluzione
console.log('[LC] main.tsx eseguito');
console.log('[LC] token:', localStorage.getItem('lc_token') ? 'presente' : 'assente');
console.log('[LC] utente:', localStorage.getItem('lc_utente') ? 'presente' : 'assente');

createRoot(document.getElementById("root")!).render(<App />);