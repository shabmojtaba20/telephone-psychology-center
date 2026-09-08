import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function phoneAuthPanelPlugin() {
  return {
    name: 'telephone-psychology-phone-auth-panel',
    transform(code, id) {
      if (!id.endsWith('/src/main.jsx')) return null;
      const authPattern = /function AuthPanel\(\{ session, onAuthenticated \}\) \{[\s\S]*?\n\}\n\nfunction AccountPanel/;
      if (!authPattern.test(code)) return null;
      const nextCode = code
        .replace("import React, { useEffect, useState } from 'react';", "import React, { useEffect, useState } from 'react';\nimport PhoneAuthPanel from './phone-auth-panel.jsx';")
        .replace(authPattern, 'const AuthPanel = PhoneAuthPanel;\n\nfunction AccountPanel');
      return { code: nextCode, map: null };
    },
  };
}

export default defineConfig({
  plugins: [phoneAuthPanelPlugin(), react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
