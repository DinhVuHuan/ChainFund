import React, { useState } from 'react'
import Identicons from 'react-identicons'
import { Link } from 'react-router-dom'
import { FaClock, FaHeart, FaCheckCircle, FaStar } from 'react-icons/fa'

const MOCK_PROJECTS = [
  /* ... giữ nguyên MOCK_PROJECTS như trước ... */
  {
    title: 'Emergency Flood Relief for Central Vietnam',
    owner: '0x1234...ABCD',
    amountRaised: 2.5,
    goal: 5,
    backers: 150,
    daysLeft: 10,
    progress: 50,
    status: 'Active',
  },
  {
    title: 'Build a Sustainable School in Remote Area',
    owner: '0x5678...EFGH',
    amountRaised: 10,
    goal: 10,
    backers: 300,
    daysLeft: 0,
    progress: 100,
    status: 'Goal Met',
  },
  {
    title: 'Medical Supplies for Local Hospitals',
    owner: '0x90AB...IJKL',
    amountRaised: 0.8,
    goal: 4,
    backers: 50,
    daysLeft: 25,
    progress: 20,
    status: 'Active',
  },
  {
    title: 'Tech Education for Underprivileged Youth',
    owner: '0xMNOP...QRST',
    amountRaised: 7.5,
    goal: 10,
    backers: 200,
    daysLeft: 5,
    progress: 75,
    status: 'Active',
  },
  {
    title: 'Support Clean Water Initiatives',
    owner: '0xUVW...WXYZ',
    amountRaised: 0.05,
    goal: 1.0,
    backers: 10,
    daysLeft: 15,
    progress: 5,
    status: 'Active',
  },
  {
    title: 'Wildlife Conservation Fund',
    owner: '0x1A2B...3C4D',
    amountRaised: 6,
    goal: 5,
    backers: 120,
    daysLeft: 3,
    progress: 100,
    status: 'Overfunded',
  },
]

const ProjectCard = ({ project, index }) => {
  const { title, owner, amountRaised, goal, backers, daysLeft, progress, status } = project
  const imageURL = `https://picsum.photos/400/300?random=${index}`

  const statusColor =
    status === 'Goal Met' || status === 'Overfunded' ? 'bg-green-600' : 'bg-red-600'
  const statusText = status === 'Goal Met' || status === 'Overfunded' ? 'FUNDED' : 'LIVE'
  const statusIcon = status === 'Goal Met' || status === 'Overfunded' ? <FaStar className="mr-1" /> : null

  return (
    <div className="
      rounded-xl shadow-lg 
      bg-white dark:bg-gray-700 
      w-72 m-4 transition duration-300 
      hover:shadow-2xl hover:scale-[1.03]
    ">
      <Link to={`/donate/${index}`}>
        <div className="relative">
          <img src={imageURL} alt={title} className="rounded-t-xl h-48 w-full object-cover" />

          <span className={`absolute top-3 right-3 text-white text-xs font-semibold px-3 py-1 rounded-full ${statusColor} flex items-center`}>
            {statusIcon}{statusText}
          </span>
        </div>

        <div className="p-5">
          <div className="flex justify-start space-x-2 items-center mb-3">
            <Identicons
              className="rounded-full shadow-md border-2 border-white dark:border-gray-700"
              string={owner}
              size={18}
            />
            <small className="text-gray-700 dark:text-gray-300 font-medium">{owner.slice(0, 8) + '...'}</small>
          </div>

          <h5 className="font-extrabold text-lg mb-3 leading-snug text-gray-800 dark:text-gray-200">{title}</h5>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full mb-3 overflow-hidden">
            <div
              className="bg-yellow-500 h-full transition-all duration-700"
              style={{ width: `${progress > 100 ? 100 : progress}%` }}
            />
          </div>

          <div className="flex justify-between items-end text-sm mt-4">
            <div className="flex flex-col">
              <span className="text-xl font-bold text-green-600 dark:text-green-400 flex items-center">
                {amountRaised} ETH
              </span>
              <small className="text-gray-500 dark:text-gray-400 mt-1">Raised / {goal} ETH</small>
            </div>

            <div className="flex flex-col items-end">
              <small className={`flex items-center ${daysLeft <= 5 && daysLeft > 0 ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}`}>
                {daysLeft > 0 ? (
                  <>
                    <FaClock className="mr-1 text-xs" />
                    {daysLeft} days left
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="mr-1 text-base text-blue-500" />
                    Finished
                  </>
                )}
              </small>

              <small className="text-gray-500 dark:text-gray-400 flex items-center mt-1">
                <FaHeart className="mr-1 text-red-500" /> {backers} Backers
              </small>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

const Projects = () => {
  const [visibleCount, setVisibleCount] = useState(6)
  const [filter, setFilter] = useState('All')

  const filteredProjects = MOCK_PROJECTS.filter(project => {
    if (filter === 'All') return true
    if (filter === 'Active') return project.status === 'Active'
    if (filter === 'Completed') return project.status === 'Goal Met' || project.status === 'Overfunded'
    return true
  })

  const projectsToShow = filteredProjects.slice(0, visibleCount)

  return (
    <div className="flex flex-col px-6 py-10 bg-gray-100 dark:bg-gray-800 min-h-screen transition-colors duration-300">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">Featured Campaigns</h2>

      {/* Filter Buttons */}
      <div className="flex justify-center gap-4 mb-6">
        {['All', 'Active', 'Completed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`
              px-5 py-2 rounded-full font-semibold shadow-md transition-all duration-300
              ${
                filter === f
                  ? 'bg-green-600 text-white shadow-lg scale-105'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-gray-600 hover:text-green-700'
              }
            `}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
        {projectsToShow.map((project, i) => (
          <ProjectCard key={i} project={project} index={i} />
        ))}
      </div>

      {visibleCount < filteredProjects.length && (
        <div className="text-center mt-10">
          <button
            onClick={() => setVisibleCount(prev => prev + 6)}
            className="px-8 py-3 border-2 border-green-600 text-green-700 dark:text-green-300 font-semibold rounded-full hover:bg-green-600 hover:text-white transition duration-300"
          >
            Load More Campaigns
          </button>
        </div>
      )}
    </div>
  )
}

export default Projects
