import { Navbar } from '#/components/custom/navbar'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: App,
  head: () => ({
    meta: [
      {
        title: "Anton's TanStack Tutorial",
      },
      {
        name: 'description',
        content: 'Save and summarize web pages with AI',
      },
      {
        property: 'og:title',
        content: "Anton's TanStack Tutorial",
      },
    ],
  }),
})

function App() {
  return (
    <div>
      <Navbar />
    </div>
  )
}
