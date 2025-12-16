import { useNavigate } from "react-router-dom";
import SvgIcon from "./SvgIcon";

export default function BackButton({ to = "/", label = "Retour à l'accueil" }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-all duration-200 border border-gray-300 flex items-center justify-center gap-2"
    >
      <SvgIcon pathD="M10 19l-7-7m0 0l7-7m-7 7h18" />
      {label}
    </button>
  );
}
