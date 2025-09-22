export const techMap: Record<string, string> = {
  // Frontend Frameworks & Libraries
  react: "react",
  reactjs: "react",
  angular: "angular",
  vue: "vuejs",
  vuejs: "vuejs",
  svelte: "svelte",
  nextjs: "nextjs",
  nuxtjs: "nuxt",
  gatsby: "gatsby",

  // Backend Frameworks
  nodejs: "nodejs",
  express: "express",
  fastapi: "fastapi",
  django: "django",
  flask: "flask",
  spring: "spring",
  rails: "rails",
  laravel: "laravel",
  symfony: "symfony",
  nestjs: "nestjs",

  // Programming Languages
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  java: "java",
  csharp: "csharp",
  "c#": "csharp",
  cplusplus: "cplusplus",
  "c++": "cplusplus",
  c: "c",
  go: "go",
  rust: "rust",
  php: "php",
  ruby: "ruby",
  kotlin: "kotlin",
  swift: "swift",
  dart: "dart",
  scala: "scala",

  // Databases
  mysql: "mysql",
  postgresql: "postgresql",
  mongodb: "mongodb",
  redis: "redis",
  sqlite: "sqlite",
  cassandra: "cassandra",
  elasticsearch: "elasticsearch",

  // Cloud & DevOps
  aws: "amazonwebservices",
  amazon: "amazonwebservices",
  azure: "azure",
  gcp: "googlecloud",
  "google-cloud": "googlecloud",
  docker: "docker",
  kubernetes: "kubernetes",
  terraform: "terraform",
  jenkins: "jenkins",

  // Mobile Development
  android: "android",
  ios: "swift",
  flutter: "flutter",
  "react-native": "react",

  // Web Technologies
  html: "html5",
  html5: "html5",
  css: "css3",
  css3: "css3",
  sass: "sass",
  scss: "sass",
  less: "less",
  tailwind: "tailwindcss",
  tailwindcss: "tailwindcss",
  bootstrap: "bootstrap",

  // Tools & Platforms
  git: "git",
  github: "github",
  gitlab: "gitlab",
  vscode: "vscode",
  webpack: "webpack",
  vite: "vite",
  npm: "npm",
  yarn: "yarn",
  pnpm: "pnpm",

  // Testing
  jest: "jest",
  cypress: "cypressio",
  playwright: "playwright",

  // State Management
  redux: "redux",
  mobx: "mobx",
  zustand: "zustand",

  // UI Libraries
  "material-ui": "materialui",
  mui: "materialui",
  "ant-design": "antdesign",
  chakra: "chakraui",

  // APIs & Services
  graphql: "graphql",
  rest: "json",
  firebase: "firebase",
  supabase: "supabase",

  // Build Tools
  babel: "babel",
  eslint: "eslint",
  prettier: "json",
  rollup: "rollup",

  // Other Popular
  electron: "electron",
  tauri: "tauri",
  threejs: "threejs",
  "three.js": "threejs",
  socketio: "socketio",
  "socket.io": "socketio",
};

export const getDevIcon = (tagName: string): string => {
  const normalizedTag = tagName.toLowerCase().replace(/[.\s-_]/g, "");
  const iconName = techMap[normalizedTag] || techMap[tagName.toLowerCase()];

  if (iconName) {
    return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${iconName}/${iconName}-original.svg`;
  }

  // Default icon for unknown technologies
  return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/devicon/devicon-original.svg`;
};
