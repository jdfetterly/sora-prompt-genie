import { Github, Linkedin, Twitter, BookOpen, Globe, Mail, Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#1a1e28] rounded-b-lg">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Copyright */}
          <div className="text-sm text-gray-400 order-1 md:order-none">
            © {currentYear} ChatBotLabs.io
          </div>

          {/* Center: Social Icons */}
          <div className="flex items-center gap-4 order-2 md:order-none">
            <a
              href="https://github.com/jdfetterly/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-300 transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/jdfetterly"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-300 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="https://x.com/realJDFetterly"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-300 transition-colors"
              aria-label="X (Twitter)"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="https://thecontextwindow.chatbotlabs.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-300 transition-colors"
              aria-label="Blog"
            >
              <BookOpen className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-gray-300 transition-colors opacity-50 cursor-not-allowed"
              aria-label="Website (Coming Soon)"
              onClick={(e) => e.preventDefault()}
            >
              <Globe className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-gray-300 transition-colors opacity-50 cursor-not-allowed"
              aria-label="Email (Coming Soon)"
              onClick={(e) => e.preventDefault()}
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>

          {/* Right: Credit */}
          <div className="text-sm text-gray-400 flex items-center gap-1 order-3 md:order-none">
            Designed & Built with{" "}
            <Heart className="w-4 h-4 text-red-500" /> by JD
          </div>
        </div>
      </div>
    </footer>
  );
}

