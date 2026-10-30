// MarkdownView imports its stylesheets for their side effects; the
// consuming app's bundler (Vite) handles them. Declared here so the
// package typechecks without depending on Vite's client types.
declare module '*.css'
