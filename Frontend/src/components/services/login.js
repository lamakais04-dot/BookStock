import axios from 'axios'

class LoginClass {
    static async handleSubmit(email,password) {
        console.log("im in handlw submit")
        const payload ={
            email:email,
            password: password
        }
        const res = await axios.post("http://localhost:8000/api/auth/login", payload, {
            withCredentials: true,
            headers: { apiKey: "123456789apikeysecure" }
        })
        return res.data
    }
}


export default LoginClass