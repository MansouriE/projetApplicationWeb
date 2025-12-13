function GuardCard({ icon, title, message, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        {icon && (
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {icon}
          </div>
        )}

        {title && (
          <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        )}
        {message && <p className="text-gray-600 mb-4">{message}</p>}

        {children}
      </div>
    </div>
  );
}
export default GuardCard;
