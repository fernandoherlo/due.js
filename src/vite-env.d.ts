/// <reference types="vite/client" />
import { IApp } from '~/src/packages/App/types/IApp';

declare global {
  interface Window { App: IApp; }
}
