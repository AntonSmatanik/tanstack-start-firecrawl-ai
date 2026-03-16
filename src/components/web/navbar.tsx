export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b bg-amber-50 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex itemds-center gap-2">
          <img
            src="https://thumb-cdn77.xvideos-cdn.com/4fe5278a-4ce6-4c55-89c0-423defdd48b5/3/xv_2_t.jpg"
            alt="Logo"
            className="size-9"
          />
          <h1 className="text-lg font-bold">TanStack</h1>
        </div>

        <div className="flex items-center gap-3">
          <button className="text-white bg-red-500 px-3 py-1 rounded-lg">
            Sing Up
          </button>
        </div>
      </div>
    </nav>
  )
}
