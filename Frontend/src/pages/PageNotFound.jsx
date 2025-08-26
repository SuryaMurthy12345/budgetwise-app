import React from 'react'
import page_not_found from '../assets/page_not_found.jpg'
import { NavLink } from 'react-router-dom'

const PageNotFound = () => {
  return (
   <>
    <div>
    <img src={page_not_found} alt="" className='h-[100vh] w-[100vw]'/>
    </div>
    <span className='text-slate-900 absolute bottom-[565px] left-[712px] text-2xl font-semibold'> Oops sorry!!</span>
    <NavLink to='/'>Home</NavLink></>
    
  )
}

export default PageNotFound