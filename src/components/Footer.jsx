import { motion } from "framer-motion";
import { Github, Globe, Mail, Linkedin } from "lucide-react";

const Footer = () => {
    return (
        <footer
            className="
        bg-white dark:bg-gray-900
        text-gray-700 dark:text-gray-300
        py-10
        transition-colors duration-300
      "
        >
            <div className="max-w-7xl mx-auto px-6">

                {/* Branding */}
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold text-gray-900 dark:text-white"
                    >
                        ChainFund <span className="text-blue-500">DApp</span>
                    </motion.h1>

                    {/* Social Icons */}
                    <div className="flex space-x-5 mt-4 md:mt-0">
                        <a href="#" className="transition">
                            <Github className="w-6 h-6 hover:text-black dark:hover:text-white" />
                        </a>
                        <a href="#" className="transition">
                            <Globe className="w-6 h-6 hover:text-black dark:hover:text-white" />
                        </a>
                        <a href="mailto:example@mail.com" className="transition">
                            <Mail className="w-6 h-6 hover:text-black dark:hover:text-white" />
                        </a>
                        <a href="#" className="transition">
                            <Linkedin className="w-6 h-6 hover:text-black dark:hover:text-white" />
                        </a>
                    </div>
                </div>

                {/* Navigation */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm mt-8">

                    <div>
                        <h2 className="text-gray-900 dark:text-white font-semibold mb-3">About</h2>
                        <ul className="space-y-2">
                            <li className="hover:text-black dark:hover:text-white cursor-pointer">Our Mission</li>
                            <li className="hover:text-black dark:hover:text-white cursor-pointer">How It Works</li>
                            <li className="hover:text-black dark:hover:text-white cursor-pointer">Team</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-gray-900 dark:text-white font-semibold mb-3">Blockchain</h2>
                        <ul className="space-y-2">
                            <li className="hover:text-black dark:hover:text-white cursor-pointer">Smart Contracts</li>
                            <li className="hover:text-black dark:hover:text-white cursor-pointer">Security</li>
                            <li className="hover:text-black dark:hover:text-white cursor-pointer">Transparency</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-gray-900 dark:text-white font-semibold mb-3">Support</h2>
                        <ul className="space-y-2">
                            <li className="hover:text-black dark:hover:text-white cursor-pointer">FAQ</li>
                            <li className="hover:text-black dark:hover:text-white cursor-pointer">Contact</li>
                            <li className="hover:text-black dark:hover:text-white cursor-pointer">Report Issue</li>
                        </ul>
                    </div>

                </div>

                {/* Bottom */}
                <p className="text-center text-gray-600 dark:text-gray-500 text-xs mt-10">
                    © {new Date().getFullYear()} ChainFund — All Rights Reserved.
                </p>

            </div>
        </footer>
    );
};

export default Footer;