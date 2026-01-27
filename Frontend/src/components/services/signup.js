import axios from 'axios'

class SignupClass {
    static async handleSubmit(formData) {
        const res = await axios.post(
            "http://localhost:8000/api/auth/signup",
            formData,
            {
                headers: { apiKey: "123456789apikeysecure" }
            }
        )

        return res.data
    }
}

export default SignupClass
