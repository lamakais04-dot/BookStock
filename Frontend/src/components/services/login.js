import axios from 'axios'

class LoginClass {
    static async handleSubmit(email, password) {
        console.log("im in handle submit")
        const payload = {
            email: email,
            password: password
        }
        const res = await axios.post("http://localhost:8000/api/auth/login", payload, {
            withCredentials: true,
            headers: { apiKey: "123456789apikeysecure" }
        })
        return res.data
    }

    static async handleLogout() {
        const res = await axios.post("http://localhost:8000/api/auth/logout", {}, {
            withCredentials: true,
            headers: { apiKey: "123456789apikeysecure" }
        })
        return {"message":"logged out succesfully"}
    }
}


export default LoginClass