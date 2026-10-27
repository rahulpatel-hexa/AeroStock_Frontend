// import { createContext, useContext, useState } from 'react'

// const AuthContext = createContext(null)

// const MOCK_USER = {
//   name: 'Hexalitics',
//   role: 'Administrator',
//   email: 'admin@aerostock.com',
// }
// const MOCK_PASSWORD = '123456'

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(() => {
//     const saved = localStorage.getItem('user')
//     return saved ? JSON.parse(saved) : null
//   })

//   // Baad me isko real API call se replace karna
//   const login = ({ email, password }) =>
//     new Promise((resolve, reject) => {
//       setTimeout(() => {
//         if (email === MOCK_USER.email && password === MOCK_PASSWORD) {
//           localStorage.setItem('user', JSON.stringify(MOCK_USER))
//           setUser(MOCK_USER)
//           resolve(MOCK_USER)
//         } else {
//           reject(new Error('Invalid email or password'))
//         }
//       }, 800)
//     })

//   const logout = () => {
//     localStorage.removeItem('user')
//     setUser(null)
//   }

//   return (
//     <AuthContext.Provider value={{ user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }

// export const useAuth = () => useContext(AuthContext)