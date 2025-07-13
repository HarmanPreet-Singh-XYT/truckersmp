import Link from 'next/link';
import { FaDiscord, FaTwitter, FaYoutube, FaTwitch, FaGamepad, FaExternalLinkAlt } from 'react-icons/fa';

const Footer = () => {
  return (
      <footer className="relative bg-red-900/20 border-t border-red-800">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />
        
        <div className="relative">
          {/* Main Footer Content */}
          <div className="max-w-7xl mx-auto px-6 pt-12">
            {/* Logo and Description Section */}
            <div className="mb-12 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <FaGamepad className="text-3xl text-red-500" />
                <h2 className="text-2xl font-bold text-white">TruckersMP Dashboard</h2>
              </div>
              <p className="text-red-400 max-w-md mx-auto md:mx-0">
                Your ultimate companion for tracking stats, managing your profile, and connecting with the TruckersMP community.
              </p>
            </div>

            {/* Links Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
              {/* Community */}
              <div>
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
                  Community
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/forums" className="text-gray-400 hover:text-blue-400 transition-colors duration-200 flex items-center gap-1 group">
                      Forums
                      <FaExternalLinkAlt className="text-xs opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                  <li>
                    <Link href="/discord" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                      Discord Server
                    </Link>
                  </li>
                  <li>
                    <Link href="/rules" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                      Rules & Guidelines
                    </Link>
                  </li>
                  <li>
                    <Link href="/events" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                      Events
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Game */}
              <div>
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
                  Game
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/download" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                      Download Client
                    </Link>
                  </li>
                  <li>
                    <Link href="/guides" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                      Getting Started
                    </Link>
                  </li>
                  <li>
                    <Link href="/mods" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                      Supported Mods
                    </Link>
                  </li>
                  <li>
                    <Link href="/servers" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                      Server Status
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
                  Support
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/help" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                      Help Center
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/appeals" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                      Ban Appeals
                    </Link>
                  </li>
                  <li>
                    <Link href="/bugs" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                      Report Bug
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
                  Legal
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/privacy" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link href="/cookies" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                      Cookie Policy
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Newsletter */}
              {/* <div className="col-span-2 md:col-span-1">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
                  Stay Updated
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Get the latest news and updates delivered to your inbox.
                </p>
                <form className="flex flex-col gap-2">
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors pr-10"
                    />
                    <HiMail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium text-sm"
                  >
                    Subscribe
                  </button>
                </form>
              </div> */}
            </div>

            {/* Social Links */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-8 border-t border-zinc-800">
              <div className="flex items-center gap-4">
                <span className="text-gray-400 text-sm">Follow us:</span>
                <div className="flex items-center gap-3">
                  <Link
                    href="/discord"
                    className="text-gray-400 hover:text-[#5865F2] transition-colors duration-200"
                    aria-label="Discord"
                  >
                    <FaDiscord className="text-xl" />
                  </Link>
                  <Link
                    href="/twitter"
                    className="text-gray-400 hover:text-[#1DA1F2] transition-colors duration-200"
                    aria-label="Twitter"
                  >
                    <FaTwitter className="text-xl" />
                  </Link>
                  <Link
                    href="/youtube"
                    className="text-gray-400 hover:text-[#FF0000] transition-colors duration-200"
                    aria-label="YouTube"
                  >
                    <FaYoutube className="text-xl" />
                  </Link>
                  <Link
                    href="/twitch"
                    className="text-gray-400 hover:text-[#9146FF] transition-colors duration-200"
                    aria-label="Twitch"
                  >
                    <FaTwitch className="text-xl" />
                  </Link>
                </div>
              </div>

              {/* Language Selector (optional) */}
              <select className="bg-zinc-800 border border-zinc-700 text-gray-400 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-blue-500">
                <option value="en">English</option>
                {/* <option value="de">Deutsch</option>
                <option value="fr">Français</option>
                <option value="es">Español</option> */}
              </select>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="bg-black/30 border-t border-zinc-800">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                <div>
                  <p className="text-gray-500 text-sm">
                    © {new Date().getFullYear()} TruckersMP Dashboard. All rights reserved.
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Built with ❤️ using Next.js and TruckersMP API
                  </p>
                </div>
                <p className="text-xs text-gray-600">
                  Not affiliated with SCS Software or TruckersMP Team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
  )
}

export default Footer