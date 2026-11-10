# Arkham card playtest tracker

A compact, no-framework card testing table. Follows your operating system/browser light or dark theme and uses square card thumbnails. Includes the 140 distinct card entries from **Moonshine Misfits**, unmodified in `packs/moonshine-misfits.json`.

## Start using it

**Quickest:** Open `index.html` in your browser. The Moonshine Misfits data is also embedded in the page as a fallback for `file://`, so a local server is not required. Thumbnails and full card art are linked to the URLs in the original JSON; you need internet access to see them.

**For a hosted or local web server:** Serve the *entire folder*. For example, from the folder:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/`. When served over HTTP(S), `packs.json` and the referenced card JSON files are the authoritative data source. The embedded copy is only a fallback if the manifest cannot be loaded. This means that you can edit/replace the pack JSON without rebuilding the page.

## Testing workflow

- Choose **Verified**, **On Paper**, **Unclear** or **Rework** in each row. The starting state is **Unreviewed**.
- Choose **+ Add marker** to toggle **Stress testing**, or enter a new marker name at the bottom of that menu. Markers are independent of the status.
- Click a thumbnail or card name to inspect the full-size art, edit status/markers, and add optional testing notes. Investigators can be flipped to show their backs.
- Search by card name, subtitle, code, traits or text; filter by expansion, faction, type, status or marker; and sort as needed.
- Click **Expansions** to remove browser-imported packs, or hide packs that come from the hosted manifest. Use **Restore** to show hidden packs again. This keeps their testing progress for future use.
- Changes save automatically in your browser's local storage. **Export progress** makes a portable JSON backup; **Import progress** restores or merges a backup (matching entries overwrite local values).

Each card is keyed by `expansion code::card code`, *not* its name. Different upgrade levels of a card therefore have independent progress.

## Add more expansions

**For yourself:** Click **+ Add JSON** and select any Arkham Build-style expansion JSON with `meta` and `data.cards`. The imported pack is kept in your browser's local storage. This is convenient for testing, but that import is not automatically shared with a friend.

**For everyone using the hosted site:** Copy additional JSON files into `packs/`, and append their relative paths to `packs.json`:

```json
{
  "packs": [
    "packs/moonshine-misfits.json",
    "packs/another-expansion.json"
  ]
}
```

**Removing expansions:** The **Expansions** button is browser-specific. **Remove** deletes a pack imported via **+ Add JSON** from that browser (not its progress); **Hide** excludes a pack loaded from `packs.json` or the built-in fallback from that browser. **Restore** shows a hidden pack again. To remove a hosted pack for everyone using GitHub Pages, also delete its entry from `packs.json` in your repository (and optionally delete its JSON file). This will take effect on the next hosted-site refresh. Removing a pack never erases its saved playtest results, so re-adding it restores existing status, notes and markers.

Each added pack needs a distinct `meta.code`, and cards need distinct `code` values within that pack. The original card JSON schema is kept intact and isn't modified by playtesting.

## Share it

### Option A: static site (simple)

Upload the entire folder to any static web host, e.g. GitHub Pages, Netlify or Cloudflare Pages. Friends can open the same URL and see the same card list. **Their testing progress is separate** unless you exchange exported progress JSON files or configure Option B. All four statuses, markers, notes and filters work without any backend.

You can also send someone just `index.html` (which contains the original pack data). It works by double-clicking, with the same local-only saving caveat.

### Option B: Cloudflare Pages + D1 (live shared progress)

The `functions/api/progress.js` file contains an *optional* small backend for Cloudflare Pages. It stores edits in a shared D1 database. Different people can edit different cards without overwriting the whole progress list; an edit to the **same** card by two people is last-write-wins. Connected browsers refresh shared data roughly every 15 seconds.

1. Put the contents of this folder in a Git repository and deploy it as a **Cloudflare Pages** project (no build step; output directory is the repository root, `.`). Keep the `functions/` directory at the project root.
2. In the Cloudflare dashboard, create a **D1 database**. Run the SQL in `schema.sql` against it (D1's console supports running SQL).
3. In your Pages project settings, add a **D1 binding named `DB`** pointing to that database.
4. Add a **secret/environment variable** named `PLAYTEST_PASSWORD`, with a strong shared password. Configure it for production, and redeploy so the binding and secret are active.
5. Open the deployed page, click **Shared sync**, enter the password and choose **Connect**. Give your friend the site link and the password separately.

When connecting, the shared database wins on cards that already exist there. By default the app also publishes any *local-only* entries that haven't been created on the server. You can uncheck that option. The app mirrors shared data into browser storage; export a backup before making large imports.

The password is not embedded in your website source and is only held in session storage in the connected browser. This simple shared-password mechanism is intended for a private playtest group, not sensitive information or public high-traffic deployments. Use HTTPS (Cloudflare Pages provides this). If sync is offline, the app retains edits locally and retries while the tab is open.

### Limits and maintenance

- The website itself does not host cards' images. Image URLs are loaded from the source JSON, and will stop showing if those source URLs stop working.
- Custom markers defined inside the page can be exported/imported. They are also shared through the Cloudflare backend if configured.
- Browser storage has quotas, especially for adding many large expansion files. For a growing hosted project, keep pack JSON files in `packs/` and update the manifest rather than importing each one into individual browsers.
- No accounts, frameworks, package installation or build step are needed for the static tracker.
