// Manually declare types since vite/client is missing
declare module "*.css";

declare const process: {
  env: {
    [key: string]: string | undefined;
    API_KEY: string;
  }
};
