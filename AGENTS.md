<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the TanStack Start bootstrap and npm startup scripts intact so the preview and published app can start.
- Typecheck the active PERÚ QUEST source graph rather than unrelated legacy course-generation data, which is not part of this app.
- Development preview builds use scripts/build-preview.mjs to pin vite.config.ts; preview-injected SPA configurations must not replace TanStack Start's virtual entry points.
