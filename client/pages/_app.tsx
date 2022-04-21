import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Link from 'next/link'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div>
      <nav className='border-b p-6'>
        <p className="text-4xl font-bold">NFT marketplace demo</p>
        <div className="flex mt-4">
          <Link href={"/"}>
            <a className="mr-8 text-blue-700">
              Home
            </a>
          </Link>
          <Link href={"/create-listing"}>
            <a className="mr-8 text-blue-700">
              Sell NFT
            </a>
          </Link>
          <Link href={"/my-assets"}>
            <a className="mr-8 text-blue-700">
              My NFTs
            </a>
          </Link>
          <Link href={"/dashboard"}>
            <a className="mr-8 text-blue-700">
              Dashboard
            </a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
