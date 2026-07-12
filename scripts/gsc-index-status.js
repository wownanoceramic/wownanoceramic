#!/usr/bin/env node
/**
 * gsc-index-status.js
 *
 * Verifica statusul de indexare al tuturor paginilor folosind
 * Google Search Console URL Inspection API si le grupeaza pe categorii
 * (echivalentul raportului "Page Indexing" din interfata GSC).
 *
 * Output:
 *   - sumar in consola grupat dupa coverageState (cu count + lista URL-uri)
 *   - export gsc-index-status.json cu structura completa per URL
 *
 * Rulare:
 *   node scripts/gsc-index-status.js
 *   node scripts/gsc-index-status.js --with-html   // adauga si varianta .html pentru paginile de oras
 *
 * Env:
 *   GSC_SA_KEY_FILE   calea catre service account JSON (default ./gsc-sa.json)
 *
 * Vezi instructiunile de setup (Google Cloud + GSC) la finalul fisierului.
 */

const fs = require('fs');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');

// ============================================================================
// CONFIG
// ============================================================================

// IMPORTANT: alege valoarea corecta in functie de TIPUL de property din GSC:
//   - URL-prefix property:  'https://www.wownanoceramic.ro/'  (cu slash final, exact ca in GSC)
//   - Domain property:      'sc-domain:wownanoceramic.ro'
// Daca pui valoarea gresita, API-ul raspunde cu 403 "User does not have sufficient
// permissions for site" chiar daca service account-ul e adaugat ca user.
const SITE_URL = 'sc-domain:wownanoceramic.ro';

const SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly'];

const SA_KEY_FILE = process.env.GSC_SA_KEY_FILE || './gsc-sa.json';

// Sursa sitemap: incearca intai fisierul local, apoi fetch la productie.
const LOCAL_SITEMAP = path.join(__dirname, '..', 'public', 'sitemap.xml');
const REMOTE_SITEMAP = 'https://www.wownanoceramic.ro/sitemap.xml';

// Rate limit: URL Inspection API are limita 600/min si 2000/zi.
// Tinem ~5 req/sec => 200ms intre request-uri (cu marja sub 600/min).
const REQUEST_DELAY_MS = 200;

// Paginile de oras (pentru flag-ul --with-html). Toate au prefixul de mai jos.
const CITY_PREFIX = 'tratament-ceramic-auto-';

const OUTPUT_JSON = path.join(__dirname, '..', 'gsc-index-status.json');

// ============================================================================
// HELPERS
// ============================================================================

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function parseLocs(xml) {
  const locs = [];
  const re = /<loc>\s*([^<]+?)\s*<\/loc>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    locs.push(m[1].trim());
  }
  return locs;
}

async function loadSitemapUrls() {
  // 1) fisier local
  if (fs.existsSync(LOCAL_SITEMAP)) {
    console.log(`Sitemap: citesc local ${LOCAL_SITEMAP}`);
    const xml = fs.readFileSync(LOCAL_SITEMAP, 'utf8');
    const locs = parseLocs(xml);
    if (locs.length) return locs;
    console.warn('Sitemap local nu contine <loc>, incerc remote...');
  }
  // 2) fetch remote (Node 18+ are fetch global)
  console.log(`Sitemap: fetch ${REMOTE_SITEMAP}`);
  const res = await fetch(REMOTE_SITEMAP);
  if (!res.ok) {
    throw new Error(`Nu pot citi sitemap-ul remote (HTTP ${res.status})`);
  }
  const xml = await res.text();
  return parseLocs(xml);
}

function isCityPage(url) {
  return url.includes(CITY_PREFIX);
}

/**
 * Adauga varianta ".html" pentru fiecare pagina de oras (URL curat + ".html"),
 * ca sa vedem explicit cum clasifica GSC redirectarile.
 */
function withHtmlVariants(urls) {
  const out = [...urls];
  const seen = new Set(urls);
  for (const url of urls) {
    if (!isCityPage(url)) continue;
    const clean = url.replace(/\/+$/, ''); // fara slash final
    const htmlUrl = `${clean}.html`;
    if (!seen.has(htmlUrl)) {
      out.push(htmlUrl);
      seen.add(htmlUrl);
    }
  }
  return out;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const withHtml = process.argv.includes('--with-html');

  // --- Auth ---
  const keyPath = path.resolve(SA_KEY_FILE);
  if (!fs.existsSync(keyPath)) {
    console.error(`\nEROARE: nu gasesc cheia service account la: ${keyPath}`);
    console.error('Seteaza env GSC_SA_KEY_FILE sau pune fisierul la ./gsc-sa.json');
    console.error('Vezi instructiunile de setup din comentariul de la finalul scriptului.\n');
    process.exit(1);
  }

  const auth = new GoogleAuth({ keyFile: keyPath, scopes: SCOPES });
  const authClient = await auth.getClient();
  const searchconsole = google.searchconsole({ version: 'v1', auth: authClient });

  console.log(`Service account: ${(await auth.getCredentials()).client_email || '(necunoscut)'}`);
  console.log(`Property (siteUrl): ${SITE_URL}\n`);

  // --- Construieste lista de URL-uri ---
  let urls = await loadSitemapUrls();
  urls = Array.from(new Set(urls)); // dedup
  if (withHtml) {
    const before = urls.length;
    urls = withHtmlVariants(urls);
    console.log(`--with-html: am adaugat ${urls.length - before} variante .html pentru paginile de oras`);
  }
  console.log(`Total URL-uri de inspectat: ${urls.length}\n`);

  // --- Inspecteaza fiecare URL ---
  const results = [];
  const errors = [];

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const progress = `[${i + 1}/${urls.length}]`;
    try {
      const res = await searchconsole.urlInspection.index.inspect({
        requestBody: { inspectionUrl: url, siteUrl: SITE_URL },
      });
      const idx = (res.data.inspectionResult && res.data.inspectionResult.indexStatusResult) || {};
      const record = {
        url,
        coverageState: idx.coverageState || '(necunoscut)',
        verdict: idx.verdict || '(necunoscut)',
        lastCrawlTime: idx.lastCrawlTime || null,
      };
      results.push(record);
      console.log(`${progress} OK  ${url}  ->  ${record.coverageState} / ${record.verdict}`);
    } catch (err) {
      const msg = (err && err.errors && err.errors[0] && err.errors[0].message) || err.message || String(err);
      errors.push({ url, error: msg });
      console.error(`${progress} ERR ${url}  ->  ${msg}`);
    }

    if (i < urls.length - 1) await sleep(REQUEST_DELAY_MS);
  }

  // --- Sumar grupat dupa coverageState ---
  const groups = {};
  for (const r of results) {
    (groups[r.coverageState] = groups[r.coverageState] || []).push(r.url);
  }

  console.log('\n========================================');
  console.log('  SUMAR GSC - Page Indexing');
  console.log('========================================\n');

  const sortedGroups = Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length);
  for (const state of sortedGroups) {
    const list = groups[state];
    console.log(`=== ${state} (${list.length}) ===`);
    for (const u of list) console.log(`  ${u}`);
    console.log('');
  }

  if (errors.length) {
    console.log(`=== ERORI (${errors.length}) ===`);
    for (const e of errors) console.log(`  ${e.url}  ->  ${e.error}`);
    console.log('');
  }

  console.log('----------------------------------------');
  console.log(`Total inspectat OK : ${results.length}`);
  console.log(`Total cu eroare    : ${errors.length}`);
  console.log(`Total URL-uri      : ${urls.length}`);
  console.log('----------------------------------------\n');

  // --- Export JSON (pentru tracking in timp) ---
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(results, null, 2), 'utf8');
  console.log(`Export scris: ${OUTPUT_JSON}`);
}

main().catch((err) => {
  console.error('\nEroare fatala:', err.message || err);
  process.exit(1);
});

/* ============================================================================
 * SETUP (de facut O SINGURA DATA inainte de prima rulare)
 * ============================================================================
 *
 * A) GOOGLE CLOUD
 *   1. Mergi la https://console.cloud.google.com/ si selecteaza/creeaza un proiect.
 *   2. Enable API: "Google Search Console API"
 *      (APIs & Services > Library > cauta "Search Console API" > Enable).
 *   3. Creeaza un Service Account:
 *      IAM & Admin > Service Accounts > Create Service Account.
 *      Nume ex: "gsc-index-checker". Nu e nevoie de roluri IAM la nivel de proiect.
 *   4. Creeaza o cheie JSON pentru acel service account:
 *      Service Account > tab Keys > Add Key > Create new key > JSON > Create.
 *      Se descarca un fisier .json.
 *   5. Salveaza fisierul ca ./gsc-sa.json in radacina proiectului
 *      (sau seteaza env GSC_SA_KEY_FILE catre calea lui).
 *      NU il comite in git (e deja acoperit de .gitignore prin *.env*; adauga
 *      explicit "gsc-sa.json" in .gitignore ca sa fii sigur).
 *
 * B) GOOGLE SEARCH CONSOLE
 *   6. Copiaza adresa de email a service account-ului (arata ca
 *      nume@proiect.iam.gserviceaccount.com) din ecranul service account-ului.
 *   7. In GSC ( https://search.google.com/search-console ) deschide property-ul
 *      wownanoceramic.ro > Settings > Users and permissions > Add user.
 *      Adauga emailul service account-ului cu permisiune "Full" (sau "Owner").
 *      "Restricted" NU permite URL Inspection API.
 *
 * C) VERIFICA TIPUL DE PROPERTY
 *   8. Daca property-ul e de tip "Domain", schimba constanta SITE_URL de mai sus in
 *      'sc-domain:wownanoceramic.ro'. Daca e "URL prefix", pastreaza URL-ul complet
 *      cu slash final, exact cum apare in GSC.
 *
 * D) DEPENDINTE
 *   9. npm install google-auth-library googleapis
 *
 * Rulare:
 *   node scripts/gsc-index-status.js
 *   node scripts/gsc-index-status.js --with-html
 * ========================================================================== */
