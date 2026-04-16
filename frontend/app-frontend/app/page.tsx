import { redirect } from 'next/navigation'

export default function RootPage() {
  // Middleware handles locale detection via NEXT_LOCALE cookie or Accept-Language
  // Default locale is 'en' — redirect to root which middleware will handle
  redirect('/en')
}
