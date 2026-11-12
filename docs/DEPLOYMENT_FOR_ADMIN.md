# Deploying q2msolutions.com

## What it is
A pre-built static website: HTML, CSS, JavaScript and images. No database, no server-side code, nothing to install on the server. Every page is a ready HTML file (for example `about/index.html`), so any normal web server can host it.

## 1. Get the build
1. Open https://github.com/psspl-jayesh/q2m-website
2. Switch the branch selector to **`build`**.
3. Click **Code → Download ZIP**, and unzip it.
4. The unzipped folder is the website. Its **contents** (not the folder itself) go into the web root. `BUILD_INFO.txt` in it shows the build date and version.

## 2. Before uploading
**Back up the current website files on the server** (download or copy the whole web root). This is your rollback.

## 3. Upload
Upload everything inside the unzipped folder to the web root, replacing the old files. Include the hidden file `.htaccess`. Some FTP programs hide files that start with a dot.

## 4. Server settings (pick the one that matches the server)
| Server | What to do |
|---|---|
| **Apache** (most shared hosting, cPanel) | Nothing extra: the uploaded `.htaccess` handles old-URL redirects, the 404 page, HTTPS and www. |
| **nginx** | Paste `nginx-redirects.conf` (in the repository: `docs/deploy/nginx-redirects.conf`) into the `server { }` block, set `root` to the uploaded folder, reload nginx. |
| **Netlify / Cloudflare Pages** | Nothing extra: they read the uploaded `_redirects` file and serve `404.html` automatically. |

- **404 page:** `404.html` in the web root. Apache uses it through `.htaccess` and nginx through the snippet (`error_page 404 /404.html;`). Netlify and Cloudflare use it automatically.
- **HTTPS:** force HTTPS. The `.htaccess` does this; on nginx, redirect port 80 to 443.
- **One address:** the site's address is `https://q2msolutions.com` (no www). Redirect `www.q2msolutions.com` to it with a 301. The `.htaccess` already does this; on nginx use `server_name www.q2msolutions.com; return 301 https://q2msolutions.com$request_uri;`.

## 5. After uploading: check
1. https://q2msolutions.com/ (home)
2. https://q2msolutions.com/bengaluru-tech-summit-2026/
3. https://q2msolutions.com/contact/
4. One service page, for example https://q2msolutions.com/ai-consulting-services/
5. One old URL, which must redirect: https://q2msolutions.com/portfolio/ → `/case-studies/`
6. A random URL, which must show the 404 page: https://q2msolutions.com/this-page-does-not-exist/
7. `http://` and `www.` versions end up on `https://q2msolutions.com/`.
8. Share https://q2msolutions.com/bengaluru-tech-summit-2026/ in LinkedIn and WhatsApp. The preview should show the page title and image (LinkedIn Post Inspector refreshes an old preview).
9. Google Search Console: submit `https://q2msolutions.com/sitemap.xml`.

## 6. After the event
**Rebuild and re-upload once after 19 Nov 2026, 6:00 PM IST.** The pages already hide the Bengaluru Tech Summit booking items in the browser after the event. The rebuild removes them from the files themselves.

## Rollback
Restore the backed-up files from step 2 to the web root.
