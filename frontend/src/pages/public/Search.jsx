import { Search as SearchIcon } from "lucide-react";

export default function Search() {
  return (
    <main className="route-placeholder">
      <SearchIcon size={34} />
      <span>MCU DIRECTORY</span>
      <h1>Search MCU services</h1>
      <p>Search across MCU websites, platforms, and digital services.</p>
      <a href="/#directory">Open service directory</a>
    </main>
  );
}
