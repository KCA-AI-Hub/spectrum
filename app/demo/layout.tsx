export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

export const metadata = {
  title: {
    template: '%s | Spectrum Demo',
    default: 'Spectrum Demo',
  },
  description: 'Spectrum 플랫폼 데모 페이지',
}