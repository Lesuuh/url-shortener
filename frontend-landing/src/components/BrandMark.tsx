import { Link } from "react-router";
import { BrandGlyph } from "./icons";

export function BrandMark({
  to = "/",
  label = "Knot home",
}: {
  to?: string;
  label?: string;
}) {
  return (
    <Link to={to} className="mark" aria-label={label}>
      <span className="mark-mark">
        <BrandGlyph />
      </span>
      knot
    </Link>
  );
}