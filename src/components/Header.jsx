import React from 'react'
import { TbAwardFilled } from 'react-icons/tb'
const Header = () => {
    return (
        <header
            className='flex justify-between items-center
            p-5 bg-white text-gray-700 hover:text-gray-900
            shadow-lg fixed top-0 left-0 right-0'
        >
            <a href="#">
                <span className="text-lg font-medium">Dapp ChainFund Demo</span>
                <div className="flex space-x-1">
                    <TbAwardFilled className="text-yellow-500 text-xl" />
                    <TbAwardFilled className="text-yellow-500 text-xl" />
                    <TbAwardFilled className="text-yellow-500 text-xl" />
                    <TbAwardFilled className="text-yellow-500 text-xl" />
                    <TbAwardFilled className="text-yellow-500 text-xl" />
                </div>
            </a>
        </header>
    )

}

export default Header
