import { useAuth } from '../../contexts/AuthContext'

export default function Profile() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="card">
        <div className="text-center py-8 text-muted">Cargando perfil...</div>
      </div>
    )
  }

  return (
    <div className="card max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Perfil de Usuario</h1>
      <div className="space-y-2">
        <div>
          <span className="font-medium">Nombre:</span> {user.first_name} {user.last_name}
        </div>
        <div>
          <span className="font-medium">Email:</span> {user.email}
        </div>
        <div>
          <span className="font-medium">Rol:</span> {user.role}
        </div>
        {/* Agrega aquí más campos si los tienes */}
      </div>
      {/* <button className="btn mt-6">Editar Perfil</button> */}
    </div>
  )
}