import React, { useState } from 'react'
import LoginClass from '../services/login.js'

export default function Login() {
    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")

    const handleSubmit = (e)=>{
        e.preventDefault()
        console.log(e)
        LoginClass.handleSubmit(email,password)

        setEmail("")
        setPassword("")
    }
  return (
    <div>
        <form onSubmit={handleSubmit}>
            <input placeholder="אימייל..." value={email} onChange={(e)=>{setEmail(e.target.value)}}/>
            <input placeholder='סיסמה...' value={password} onChange={(e)=>{setPassword(e.target.value)}}/>
            <button type="submit">התחבר</button>
        </form>

    </div>
  )
}
