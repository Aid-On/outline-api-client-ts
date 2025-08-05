declare module 'react-syntax-highlighter' {
  import { ComponentType } from 'react';
  
  export interface SyntaxHighlighterProps {
    language?: string;
    style?: any;
    children: string;
    [key: string]: any;
  }
  
  export const Light: ComponentType<SyntaxHighlighterProps>;
  export const PrismLight: ComponentType<SyntaxHighlighterProps>;
}

declare module 'react-syntax-highlighter/dist/esm/styles/hljs' {
  export const docco: any;
  export const github: any;
  export const monokai: any;
}