'use client'

const WHATSAPP_NUMBER = '254700532298'
const DEFAULT_MESSAGE = encodeURIComponent(
  'Hi Mercy Gold Honey — I have a question about your honey.'
)

export default function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${DEFAULT_MESSAGE}`

  return (
    <a
      href={href}
      className="whatsapp-float"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      title="Chat on WhatsApp"
    >
      <svg
        className="whatsapp-float__icon"
        viewBox="0 0 32 32"
        aria-hidden="true"
        focusable="false"
      >
        <path
          fill="currentColor"
          d="M16.004 3C9.38 3 4 8.38 4 15.004c0 2.31.66 4.46 1.8 6.3L4 29l7.9-1.78A11.96 11.96 0 0 0 16.004 27C22.62 27 28 21.62 28 15.004 28 8.38 22.62 3 16.004 3zm0 21.9c-1.94 0-3.74-.55-5.26-1.5l-.38-.23-4.68 1.06 1.08-4.56-.25-.4A9.88 9.88 0 0 1 6.1 15c0-5.46 4.44-9.9 9.9-9.9s9.9 4.44 9.9 9.9-4.44 9.9-9.9 9.9zm5.44-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.74-1.64-2.04-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35z"
        />
      </svg>
      <span className="whatsapp-float__label">WhatsApp</span>
    </a>
  )
}
