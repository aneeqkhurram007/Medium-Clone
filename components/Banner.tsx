import React from 'react'

const Banner = () => {
  return (
    <div
      className={`flex items-center justify-between
    border-y border-black bg-yellow-300 py-10 lg:py-0
    `}
    >
      <div className={`space-y-5 px-10`}>
        <h1 className={`max-w-xl font-serif text-6xl`}>
          <span className={`underline decoration-black decoration-4`}>
            Medium
          </span>{' '}
          is a place to write, read, and connect
        </h1>
        <h2>It's easy and free to post your ideas</h2>
      </div>
      <img
        className={`hidden h-32 md:inline-flex lg:h-full`}
        src={`https://iconape.com/wp-content/png_logo_vector/cib-medium-m.png`}
        alt=""
      />
    </div>
  )
}

export default Banner
