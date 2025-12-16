import SvgIcon from "../common/SvgIcon";

export default function GuardIcon({ type }) {
  let pathD;

  switch (type) {
    case "error":
      pathD = "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z";
      break;
    case "unauthorized":
      pathD =
        "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z";
      break;
    default:
      pathD = "";
  }

  return <SvgIcon pathD={pathD} className="w-8 h-8 text-red-500" />;
}
