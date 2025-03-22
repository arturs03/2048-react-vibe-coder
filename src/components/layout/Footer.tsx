export function Footer() {
  return (
    <footer className="border-t py-6 bg-white/50">
      <div className="container mx-auto px-4">
        <div className="text-center text-sm text-gray-600">
          <p>
            Built with React, Canvas, and Supabase. The source code is available on{' '}
            <a
              href="https://github.com/yourusername/hex-2048"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#776e65] hover:underline"
            >
              GitHub
            </a>
            .
          </p>
          <p className="mt-2">
            Inspired by{' '}
            <a
              href="https://play2048.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#776e65] hover:underline"
            >
              2048 by Gabriele Cirulli
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
} 