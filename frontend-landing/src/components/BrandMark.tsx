import { Link } from "react-router";

export function BrandMark({
  to = "/",
  label = "Knot home",
}: {
  to?: string;
  label?: string;
}) {
  return (
    <Link to={to} className="mark" aria-label={label}>
      <img
        src="/logo.png"
        alt=""
        aria-hidden
        draggable={false}
        className="logo-img h-7 w-7"
      />
      knot
    </Link>
  );
}