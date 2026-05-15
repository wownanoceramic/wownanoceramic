'use client'

import { useEffect, useState } from 'react'

type ConsentState = {
  analytics: boolean
  marketing: boolean
}

const COOKIE_KEY = 'wow_cookie_consent'
const COOKIE_EXPIRY_DAYS = 365

function saveCookieConsent(consent: ConsentState & { decided: boolean }) {
  const expires = new Date()
  expires.setDate(expires.getDate() + COOKIE_EXPIRY_DAYS)
  document.cookie = `${COOKIE_KEY}=${JSON.stringify(consent)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
}

function getCookieConsent(): (ConsentState & { decided: boolean }) | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(?:^|; )' + COOKIE_KEY + '=([^;]*)'))
  if (!match) return null
  try {
    return JSON.parse(decodeURIComponent(match[1]))
  } catch {
    return null
  }
}

function loadGoogleAnalytics() {
  if (document.querySelector('script[data-ga]')) return
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID
  if (!GA_ID) return
  const s1 = document.createElement('script')
  s1.async = true
  s1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  s1.setAttribute('data-ga', '1')
  document.head.appendChild(s1)
  const s2 = document.createElement('script')
  s2.setAttribute('data-ga', '1')
  s2.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`
  document.head.appendChild(s2)
}

function loadMetaPixel() {
  if (document.querySelector('script[data-pixel]')) return
  const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID
  if (!PIXEL_ID) return
  const s = document.createElement('script')
  s.setAttribute('data-pixel', '1')
  s.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL_ID}');fbq('track','PageView');`
  document.head.appendChild(s)
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [consent, setConsent] = useState<ConsentState>({
    analytics: true,
    marketing: true,
  })

  useEffect(() => {
    const saved = getCookieConsent()
    if (!saved || !saved.decided) {
      setVisible(true)
      return
    }
    if (saved.analytics) loadGoogleAnalytics()
    if (saved.marketing) loadMetaPixel()
  }, [])

  function applyConsent(state: ConsentState) {
    saveCookieConsent({ ...state, decided: true })
    if (state.analytics) loadGoogleAnalytics()
    if (state.marketing) loadMetaPixel()
    setVisible(false)
  }

  function acceptAll() {
    applyConsent({ analytics: true, marketing: true })
  }

  function rejectAll() {
    applyConsent({ analytics: false, marketing: false })
  }

  function saveSelection() {
    applyConsent(consent)
  }

  if (!visible) return null

  return (
    <>
      {/* Overlay semi-transparent */}
      <div style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 9998,
      }} />

      {/* Banner */}
      <div style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        zIndex: 9999,
        background: '#1a1a1a',
        color: '#f0f0f0',
        borderTop: '1px solid #333',
        padding: '20px 24px 24px',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px',
        lineHeight: '1.6',
        boxShadow: '0 -4px 32px rgba(0,0,0,0.4)',
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: '12px' }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '15px', color: '#fff' }}>
              🍪 Folosim cookie-uri
            </p>
            <p style={{ margin: '6px 0 0', color: '#bbb', fontSize: '13px' }}>
              Folosim cookie-uri esențiale pentru funcționarea site-ului și, cu acordul tău, cookie-uri analitice (Google Analytics) și de marketing (Facebook Pixel) pentru a îmbunătăți experiența și reclamele. Poți refuza oricând.{' '}
              <a href="/cookies" style={{ color: '#aaa', textDecoration: 'underline' }}>
                Politica cookies
              </a>
            </p>
          </div>

          {/* Personalizare detalii */}
          {showDetails && (
            <div style={{
              background: '#252525',
              borderRadius: '8px',
              padding: '14px 16px',
              marginBottom: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}>
              {/* Esențiale — mereu active */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'not-allowed', opacity: 0.6 }}>
                <input type="checkbox" checked disabled style={{ marginTop: '3px', accentColor: '#555' }} />
                <span>
                  <strong style={{ color: '#ddd' }}>Cookie-uri esențiale</strong>
                  <span style={{ display: 'block', color: '#999', fontSize: '12px' }}>
                    Coș de cumpărături, sesiune, securitate. Nu pot fi dezactivate.
                  </span>
                </span>
              </label>

              {/* Analytics */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={consent.analytics}
                  onChange={e => setConsent(prev => ({ ...prev, analytics: e.target.checked }))}
                  style={{ marginTop: '3px', accentColor: '#e8a020' }}
                />
                <span>
                  <strong style={{ color: '#ddd' }}>Cookie-uri analitice</strong>
                  <span style={{ display: 'block', color: '#999', fontSize: '12px' }}>
                    Google Analytics — ne ajută să înțelegem cum e folosit site-ul. Datele sunt anonimizate.
                  </span>
                </span>
              </label>

              {/* Marketing */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={consent.marketing}
                  onChange={e => setConsent(prev => ({ ...prev, marketing: e.target.checked }))}
                  style={{ marginTop: '3px', accentColor: '#e8a020' }}
                />
                <span>
                  <strong style={{ color: '#ddd' }}>Cookie-uri de marketing</strong>
                  <span style={{ display: 'block', color: '#999', fontSize: '12px' }}>
                    Facebook Pixel — măsoară eficiența reclamelor. Date gestionate de Meta Platforms.
                  </span>
                </span>
              </label>
            </div>
          )}

          {/* Butoane */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={acceptAll}
              style={{
                background: '#e8a020', color: '#111', border: 'none',
                borderRadius: '6px', padding: '10px 22px',
                fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Accept tot
            </button>

            <button
              onClick={rejectAll}
              style={{
                background: 'transparent', color: '#ccc',
                border: '1px solid #555',
                borderRadius: '6px', padding: '10px 22px',
                fontWeight: 500, fontSize: '14px', cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Refuz tot
            </button>

            {!showDetails ? (
              <button
                onClick={() => setShowDetails(true)}
                style={{
                  background: 'transparent', color: '#888',
                  border: 'none', padding: '10px 10px',
                  fontSize: '13px', cursor: 'pointer',
                  textDecoration: 'underline',
                  whiteSpace: 'nowrap',
                }}
              >
                Personalizez opțiunile
              </button>
            ) : (
              <button
                onClick={saveSelection}
                style={{
                  background: '#333', color: '#ddd',
                  border: '1px solid #555',
                  borderRadius: '6px', padding: '10px 18px',
                  fontWeight: 500, fontSize: '14px', cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Salvez selecția
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  )
}
